import { Peer } from 'peerjs';

// Generates short 5-letter readable room codes like 'VIPER', 'DELTA', 'SHADOW'
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CODE_LETTERS.charAt(Math.floor(Math.random() * CODE_LETTERS.length));
  }
  return code;
}

const PEER_PREFIX = 'delta-undercover-';

const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

class PartyNetwork {
  constructor() {
    this.peer = null;
    this.isHost = false;
    this.roomCode = null;
    this.myPlayerId = null;
    this.myPlayerName = null;
    this.connections = new Map(); // Map<playerId, DataConnection>
    this.rawConnections = new Map(); // Map<peerId, DataConnection>
    this.hostConnection = null; // For guest: DataConnection to host
    this.pendingHostMessages = [];
    this.messageHandlers = new Set();
    this.statusHandlers = new Set();
    this.state = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
    this.broadcastChannel = null; // Local fallback for same-browser tabs
  }

  onMessage(callback) {
    this.messageHandlers.add(callback);
    return () => this.messageHandlers.delete(callback);
  }

  onStatusChange(callback) {
    this.statusHandlers.add(callback);
    return () => this.statusHandlers.delete(callback);
  }

  setStatus(status, error = null) {
    this.state = status;
    this.statusHandlers.forEach(cb => cb(status, error));
  }

  emitMessage(msg) {
    this.messageHandlers.forEach(cb => cb(msg));
  }

  // --- HOST ROOM CREATION ---
  createRoom(hostName, preferredCode = null) {
    this.disconnect();
    this.isHost = true;
    this.roomCode = (preferredCode || generateRoomCode()).toUpperCase();
    this.myPlayerId = `host-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.myPlayerName = hostName;
    this.setStatus('CONNECTING');

    const peerId = `${PEER_PREFIX}${this.roomCode}`;

    try {
      this.broadcastChannel = new BroadcastChannel(`delta-room-${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        const { senderId, targetPlayerId, payload } = event.data || {};
        if (senderId !== this.myPlayerId) {
          if (!targetPlayerId || targetPlayerId === this.myPlayerId) {
            this.handleIncomingMessage(senderId, payload);
          }
        }
      };
    } catch {
      // BroadcastChannel not available in older environments
    }

    this.peer = new Peer(peerId, PEER_CONFIG);

    this.peer.on('open', () => {
      this.setStatus('CONNECTED');
    });

    this.peer.on('connection', (conn) => {
      this.rawConnections.set(conn.peer, conn);
      if (conn.metadata?.playerId) {
        this.connections.set(conn.metadata.playerId, conn);
      }

      // CRITICAL: Attach data handler directly to conn without waiting for conn.open
      conn.on('data', (data) => {
        const pid = data?.playerId || conn.metadata?.playerId;
        if (pid) {
          this.connections.set(pid, conn);
        }
        this.handleIncomingMessage(conn.peer, data, conn);
      });

      conn.on('open', () => {
        const pid = conn.metadata?.playerId;
        if (pid) {
          this.connections.set(pid, conn);
        }
      });

      conn.on('close', () => {
        this.removeConnection(conn.peer);
      });

      conn.on('error', () => {
        this.removeConnection(conn.peer);
      });
    });

    this.peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // Room code collision: retry with fresh code
        this.createRoom(hostName, generateRoomCode());
      } else {
        this.setStatus('ERROR', err.message || 'Network error');
      }
    });

    return {
      roomCode: this.roomCode,
      myPlayerId: this.myPlayerId
    };
  }

  // --- JOIN EXISTING ROOM ---
  joinRoom(roomCode, playerName) {
    this.disconnect();
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();
    this.myPlayerId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.myPlayerName = playerName;
    this.setStatus('CONNECTING');

    const hostPeerId = `${PEER_PREFIX}${this.roomCode}`;

    try {
      this.broadcastChannel = new BroadcastChannel(`delta-room-${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        const { senderId, targetPlayerId, payload } = event.data || {};
        if (senderId !== this.myPlayerId) {
          if (!targetPlayerId || targetPlayerId === this.myPlayerId) {
            this.emitMessage(payload);
          }
        }
      };
    } catch {
      // BroadcastChannel ignored
    }

    this.peer = new Peer(PEER_CONFIG);

    this.peer.on('open', () => {
      const conn = this.peer.connect(hostPeerId, {
        reliable: true,
        metadata: {
          playerId: this.myPlayerId,
          playerName: this.myPlayerName
        }
      });

      this.hostConnection = conn;

      conn.on('data', (data) => {
        this.emitMessage(data);
      });

      conn.on('open', () => {
        this.setStatus('CONNECTED');

        // Flush any pending messages queued while opening
        if (this.pendingHostMessages && this.pendingHostMessages.length > 0) {
          this.pendingHostMessages.forEach(msg => {
            try {
              conn.send(msg);
            } catch (e) {
              console.warn('Failed to flush message to host', e);
            }
          });
          this.pendingHostMessages = [];
        }

        // Send JOIN request
        this.sendToHost({
          type: 'PLAYER_JOIN_REQUEST',
          playerId: this.myPlayerId,
          playerName: this.myPlayerName
        });
      });

      conn.on('close', () => {
        this.setStatus('DISCONNECTED');
        this.emitMessage({ type: 'HOST_DISCONNECTED' });
      });

      conn.on('error', () => {
        this.setStatus('ERROR', 'Unable to connect to party host.');
      });
    });

    this.peer.on('error', () => {
      this.setStatus('ERROR', 'Failed to reach party server. Check code and connection.');
    });

    return {
      roomCode: this.roomCode,
      myPlayerId: this.myPlayerId
    };
  }

  handleIncomingMessage(senderPeerId, data, conn = null) {
    if (this.isHost) {
      const pid = data?.playerId || (conn?.metadata?.playerId);
      if (pid && conn) {
        this.connections.set(pid, conn);
      }
    }
    this.emitMessage(data);
  }

  removeConnection(peerId) {
    this.rawConnections.delete(peerId);
    // Find playerId associated with this peerId
    for (const [playerId, conn] of this.connections.entries()) {
      if (conn.peer === peerId) {
        this.connections.delete(playerId);
        this.emitMessage({
          type: 'PLAYER_LEFT',
          playerId
        });
        break;
      }
    }
  }

  // --- SENDING METHODS ---
  sendToHost(message) {
    if (this.isHost) {
      this.emitMessage(message);
      return;
    }

    let sent = false;
    if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send(message);
        sent = true;
      } catch (err) {
        console.warn('Error sending to host connection:', err);
      }
    }

    if (!sent) {
      if (!this.pendingHostMessages) this.pendingHostMessages = [];
      this.pendingHostMessages.push(message);
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.myPlayerId,
          payload: message
        });
      } catch {
        // Ignore
      }
    }
  }

  broadcast(message, includeSelf = true) {
    // Host broadcasts to all clients
    if (includeSelf) {
      this.emitMessage(message);
    }

    const sentConns = new Set();
    // Send to mapped player connections
    for (const [pid, conn] of this.connections.entries()) {
      if (conn && conn.open && !sentConns.has(conn)) {
        try {
          conn.send(message);
          sentConns.add(conn);
        } catch (e) {
          console.warn('Failed to broadcast to player', pid, e);
        }
      }
    }

    // Send to any raw connections not yet mapped
    for (const [peerId, conn] of this.rawConnections.entries()) {
      if (conn && conn.open && !sentConns.has(conn)) {
        try {
          conn.send(message);
          sentConns.add(conn);
        } catch (e) {
          console.warn('Failed to broadcast to raw conn', peerId, e);
        }
      }
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.myPlayerId,
          payload: message
        });
      } catch {
        // Ignore
      }
    }
  }

  sendToPlayer(targetPlayerId, message) {
    if (targetPlayerId === this.myPlayerId) {
      this.emitMessage(message);
      return;
    }
    const conn = this.connections.get(targetPlayerId);
    if (conn && conn.open) {
      try {
        conn.send(message);
      } catch (e) {
        console.warn('Failed to send to player', targetPlayerId, e);
      }
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.myPlayerId,
          targetPlayerId,
          payload: message
        });
      } catch {
        // Ignore
      }
    }
  }

  disconnect() {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // Ignore
      }
      this.broadcastChannel = null;
    }
    if (this.hostConnection) {
      try {
        this.hostConnection.close();
      } catch {
        // Ignore
      }
      this.hostConnection = null;
    }
    this.pendingHostMessages = [];
    this.connections.forEach(conn => {
      try { conn.close(); } catch { /* Ignore */ }
    });
    this.connections.clear();
    this.rawConnections.forEach(conn => {
      try { conn.close(); } catch { /* Ignore */ }
    });
    this.rawConnections.clear();

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // Ignore
      }
      this.peer = null;
    }
    this.isHost = false;
    this.roomCode = null;
    this.myPlayerId = null;
    this.myPlayerName = null;
    this.setStatus('DISCONNECTED');
  }
}

export const partyNetwork = new PartyNetwork();
