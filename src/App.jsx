import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, HelpCircle, RotateCcw, VenetianMask, Shield, Eye, ArrowLeft, Wifi } from 'lucide-react';
import ModeSelector from './components/ModeSelector/ModeSelector';
import Setup from './components/Setup/Setup';
import PassReveal from './components/PassReveal/PassReveal';
import Discussion from './components/Discussion/Discussion';
import Voting from './components/Voting/Voting';
import RevealModal from './components/RevealModal/RevealModal';
import GameOver from './components/GameOver/GameOver';
import RulesModal from './components/RulesModal/RulesModal';
import DeveloperModal from './components/DeveloperModal/DeveloperModal';
import DeltaLogo from './components/Logo/DeltaLogo';

// Party Play Components
import PartyLobby from './components/Party/PartyLobby';
import PartySecretReveal from './components/Party/PartySecretReveal';
import PartyClueRound from './components/Party/PartyClueRound';
import PartyRoundDecision from './components/Party/PartyRoundDecision';
import PartyDiscussion3Min from './components/Party/PartyDiscussion3Min';
import PartyVoting from './components/Party/PartyVoting';

import { getRandomWordPair } from './data/words';
import { sound } from './utils/audio';
import { partyNetwork } from './utils/partyNetwork';
import styles from './App.module.css';

export default function App() {
  const [gameMode, setGameMode] = useState('SELECT_MODE'); // 'SELECT_MODE' | 'LOCAL' | 'PARTY'

  // Common UI State
  const [rulesOpen, setRulesOpen] = useState(false);
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);
  const [showDevCreditToast, setShowDevCreditToast] = useState(false);

  // --- LOCAL PLAY STATE ---
  const [localStage, setLocalStage] = useState('SETUP'); // 'SETUP' | 'PASS_REVEAL' | 'DISCUSSION' | 'VOTING' | 'GAME_OVER'
  const [localPlayers, setLocalPlayers] = useState([]);
  const [localCurrentRevealIndex, setLocalCurrentRevealIndex] = useState(0);
  const [localWordPair, setLocalWordPair] = useState({ civilian: '', imposter: '' });
  const [localRoundNumber, setLocalRoundNumber] = useState(1);
  const [localStarterPlayer, setLocalStarterPlayer] = useState(null);
  const [localEliminatedModalData, setLocalEliminatedModalData] = useState(null);
  const [localWinner, setLocalWinner] = useState(null);
  const [localLastConfig, setLocalLastConfig] = useState(null);
  const [localTotalGameTime, setLocalTotalGameTime] = useState(300);
  const [localRemainingTime, setLocalRemainingTime] = useState(300);

  // --- PARTY PLAY STATE ---
  const [partyStage, setPartyStage] = useState('LOBBY'); // 'LOBBY' | 'SECRET_REVEAL' | 'CLUE_ROUND' | 'ROUND_DECISION' | 'DISCUSSION_3MIN' | 'VOTING' | 'GAME_OVER'
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [myPlayerName, setMyPlayerName] = useState('');
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [myRoleData, setMyRoleData] = useState(null); // { isImposter, word }
  const [partyReadyCount, setPartyReadyCount] = useState(0);
  const [hasMemorized, setHasMemorized] = useState(false);
  
  // Party Game Progress
  const [partyRoundNumber, setPartyRoundNumber] = useState(1);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState(null);
  const [cluesFeed, setCluesFeed] = useState([]);
  const [cluesHistory, setCluesHistory] = useState([]);
  const [decisionVotes, setDecisionVotes] = useState({});
  const [hasVotedDecision, setHasVotedDecision] = useState(false);
  const [partyDiscussion3MinSeconds, setPartyDiscussion3MinSeconds] = useState(180);
  const [partyDiscussionChatFeed, setPartyDiscussionChatFeed] = useState([]);
  const [votingBallots, setVotingBallots] = useState({});
  const [hasVotedParty, setHasVotedParty] = useState(false);
  const [partyEliminatedModalData, setPartyEliminatedModalData] = useState(null);
  const [partyWinner, setPartyWinner] = useState(null);
  const [partyWordPair, setPartyWordPair] = useState({ civilian: '', imposter: '' });
  const [partyTypingUsers, setPartyTypingUsers] = useState({}); // { [playerId]: { playerName, time } }

  // Refs for host state tracking
  const hostGameRef = useRef({
    players: [],
    imposterCount: 1,
    wordPair: { civilian: '', imposter: '' },
    alivePlayers: [],
    turnOrder: [],
    turnIndex: 0,
    roundClues: [],
    allClues: [],
    readyPlayers: new Set(),
    decisionVotes: {},
    ballots: {},
    discussionTimer: null
  });

  // Handle Easter egg developer tap
  const handleBrandClick = () => {
    const next = devTapCount + 1;
    setDevTapCount(next);
    if (next >= 3) {
      sound.play('click');
      setDevModalOpen(true);
      setDevTapCount(0);
    }
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Check URL on load for ?room=CODE
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room')) {
        setGameMode('PARTY');
      }
    } catch {
      // Ignore
    }
  }, []);

  // Auto-expire typing indicators after 3 seconds of inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      setPartyTypingUsers(prev => {
        const now = Date.now();
        let changed = false;
        const next = {};
        for (const [id, data] of Object.entries(prev)) {
          if (now - data.time < 3500) {
            next[id] = data;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- PARTY NETWORK MESSAGE LISTENER ---
  useEffect(() => {
    const unsubscribe = partyNetwork.onMessage((msg) => {
      if (!msg) return;

      switch (msg.type) {
        // Player joined lobby (Host receives)
        case 'PLAYER_JOIN_REQUEST': {
          if (partyNetwork.isHost) {
            const current = hostGameRef.current.players;
            if (!current.some(p => p.id === msg.playerId)) {
              const updated = [...current, { id: msg.playerId, name: msg.playerName, isHost: false }];
              hostGameRef.current.players = updated;
              partyNetwork.broadcast({
                type: 'LOBBY_PLAYERS_SYNC',
                players: updated
              });
              sound.play('click');
            }
          }
          break;
        }

        // Sync lobby roster (All receive from host)
        case 'LOBBY_PLAYERS_SYNC': {
          setConnectedPlayers(msg.players || []);
          break;
        }

        // Game Started (Host broadcasts to all)
        case 'GAME_STARTED': {
          setPartyWordPair(msg.wordPair);
          setPartyRoundNumber(1);
          setCluesFeed([]);
          setCluesHistory([]);
          setDecisionVotes({});
          setHasVotedDecision(false);
          setPartyDiscussionChatFeed([]);
          setVotingBallots({});
          setHasVotedParty(false);
          setPartyEliminatedModalData(null);
          setPartyWinner(null);
          setPartyReadyCount(0);
          setHasMemorized(false);
          setPartyStage('SECRET_REVEAL');
          sound.play('start');
          break;
        }

        // Private role assignment sent to individual player
        case 'ASSIGN_ROLE': {
          setMyRoleData(msg.roleData);
          break;
        }

        // A player confirmed memorization
        case 'PLAYER_CONFIRMED_MEMORIZE': {
          if (partyNetwork.isHost) {
            hostGameRef.current.readyPlayers.add(msg.playerId);
            const count = hostGameRef.current.readyPlayers.size;
            partyNetwork.broadcast({
              type: 'UPDATE_READY_COUNT',
              count
            });
            // If all players are ready, auto-start clue round!
            if (count >= hostGameRef.current.players.length) {
              startPartyClueRoundInternal();
            }
          }
          break;
        }

        case 'UPDATE_READY_COUNT': {
          setPartyReadyCount(msg.count);
          break;
        }

        // Clue Round Started
        case 'START_CLUE_ROUND': {
          setPartyStage('CLUE_ROUND');
          setCurrentTurnPlayerId(msg.firstTurnPlayerId);
          setCluesFeed([]);
          sound.play('reveal');
          break;
        }

        // Clue submitted
        case 'CLUE_SUBMITTED_BY_PLAYER': {
          if (partyNetwork.isHost) {
            const h = hostGameRef.current;
            const newClue = msg.clue || {
              id: `clue-${msg.playerId}-${Date.now()}`,
              playerId: msg.playerId,
              playerName: msg.playerName,
              text: msg.text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            h.roundClues.push(newClue);
            h.allClues.push(newClue);

            // Broadcast new clue to everyone
            partyNetwork.broadcast({
              type: 'NEW_CLUE_BROADCAST',
              clue: newClue
            });

            // Advance turn
            h.turnIndex += 1;
            if (h.turnIndex < h.turnOrder.length) {
              const nextPlayerId = h.turnOrder[h.turnIndex].id;
              partyNetwork.broadcast({
                type: 'TURN_CHANGED',
                nextTurnPlayerId: nextPlayerId
              });
            } else {
              // Entire round finished! Proceed to Round Decision Vote
              setTimeout(() => {
                h.decisionVotes = {};
                partyNetwork.broadcast({
                  type: 'START_ROUND_DECISION',
                  roundNumber: h.roundNumber || 1
                });
              }, 1200);
            }
          }
          break;
        }

        case 'NEW_CLUE_BROADCAST': {
          sound.play('click');
          const incomingClue = msg.clue;
          if (incomingClue) {
            setCluesFeed(prev => {
              if (incomingClue.id && prev.some(c => c.id === incomingClue.id)) return prev;
              return [...prev, incomingClue];
            });
            setCluesHistory(prev => {
              if (incomingClue.id && prev.some(c => c.id === incomingClue.id)) return prev;
              return [...prev, incomingClue];
            });
          }
          break;
        }

        case 'TURN_CHANGED': {
          setCurrentTurnPlayerId(msg.nextTurnPlayerId);
          sound.play('reveal');
          break;
        }

        // Round Decision
        case 'START_ROUND_DECISION': {
          setPartyStage('ROUND_DECISION');
          setDecisionVotes({});
          setHasVotedDecision(false);
          sound.play('reveal');
          break;
        }

        // Cast decision vote
        case 'CAST_DECISION_VOTE': {
          if (partyNetwork.isHost) {
            hostGameRef.current.decisionVotes[msg.playerId] = msg.choice;
            const votes = { ...hostGameRef.current.decisionVotes };
            partyNetwork.broadcast({
              type: 'DECISION_VOTES_SYNC',
              votes
            });

            const totalVotes = Object.keys(votes).length;
            const aliveCount = hostGameRef.current.alivePlayers.length;
            if (totalVotes >= aliveCount) {
              resolvePartyDecisionInternal();
            }
          }
          break;
        }

        case 'DECISION_VOTES_SYNC': {
          setDecisionVotes(msg.votes);
          break;
        }

        // 3-Minute Discussion Started
        case 'START_3MIN_DISCUSSION': {
          setPartyStage('DISCUSSION_3MIN');
          setPartyDiscussion3MinSeconds(180);
          setPartyDiscussionChatFeed([]);
          sound.play('start');
          break;
        }

        // Discussion Chat Message
        case 'DISCUSSION_CHAT_MESSAGE': {
          const chatMsg = msg.chatMsg;
          if (chatMsg) {
            sound.play('click');
            setPartyDiscussionChatFeed(prev => {
              if (chatMsg.id && prev.some(m => m.id === chatMsg.id)) return prev;
              return [...prev, chatMsg];
            });

            // Immediately clear sender's typing indicator
            if (chatMsg.playerId) {
              setPartyTypingUsers(prev => {
                if (!prev[chatMsg.playerId]) return prev;
                const next = { ...prev };
                delete next[chatMsg.playerId];
                return next;
              });
            }

            // CRITICAL SYNC FIX:
            // When Host receives a chat message from ANY guest,
            // Host immediately re-broadcasts it so all other members in the room see it!
            // Exclude self (includeSelf: false) and mark _relayed: true to prevent recursion.
            if (partyNetwork.isHost && chatMsg.playerId !== myPlayerId && !msg._relayed) {
              partyNetwork.broadcast({
                type: 'DISCUSSION_CHAT_MESSAGE',
                chatMsg,
                _relayed: true
              }, false);
            }
          }
          break;
        }

        // Typing Status Sync
        case 'PLAYER_TYPING': {
          const { playerId, playerName, isTyping } = msg;
          if (playerId && playerId !== myPlayerId) {
            setPartyTypingUsers(prev => {
              const next = { ...prev };
              if (isTyping) {
                next[playerId] = { playerName, time: Date.now() };
              } else {
                delete next[playerId];
              }
              return next;
            });

            // Host relays typing notification to all other connected peers
            if (partyNetwork.isHost && !msg._relayed) {
              partyNetwork.broadcast({
                type: 'PLAYER_TYPING',
                playerId,
                playerName,
                isTyping,
                _relayed: true
              }, false);
            }
          }
          break;
        }

        // Time sync from host
        case 'SYNC_3MIN_TIMER': {
          setPartyDiscussion3MinSeconds(msg.seconds);
          break;
        }

        // Voting stage started
        case 'START_PARTY_VOTING': {
          setPartyStage('VOTING');
          setVotingBallots({});
          setHasVotedParty(false);
          sound.play('reveal');
          break;
        }

        // Ballot submitted
        case 'SUBMIT_BALLOT': {
          if (partyNetwork.isHost) {
            hostGameRef.current.ballots[msg.voterId] = msg.targetId;
            const ballots = { ...hostGameRef.current.ballots };
            partyNetwork.broadcast({
              type: 'BALLOTS_SYNC',
              ballots
            });

            const totalBallots = Object.keys(ballots).length;
            const aliveCount = hostGameRef.current.alivePlayers.length;
            if (totalBallots >= aliveCount) {
              resolvePartyVotingInternal();
            }
          }
          break;
        }

        case 'BALLOTS_SYNC': {
          setVotingBallots(msg.ballots);
          break;
        }

        // Elimination Reveal
        case 'PARTY_ELIMINATION_REVEAL': {
          setPartyEliminatedModalData({
            player: msg.eliminatedPlayer,
            remainingImposters: msg.remainingImposters,
            remainingAliveCount: msg.remainingAliveCount,
            isGameOver: msg.isGameOver,
            winner: msg.winner
          });
          if (msg.isGameOver) {
            setPartyWinner(msg.winner);
          }
          break;
        }

        // Advance to next clue round
        case 'START_NEXT_PARTY_ROUND': {
          setPartyEliminatedModalData(null);
          setPartyRoundNumber(msg.roundNumber);
          setCluesFeed([]);
          setPartyStage('CLUE_ROUND');
          setCurrentTurnPlayerId(msg.firstTurnPlayerId);
          sound.play('start');
          break;
        }

        // Game Over
        case 'PARTY_GAME_OVER_STAGE': {
          setPartyEliminatedModalData(null);
          setPartyStage('GAME_OVER');
          break;
        }

        case 'HOST_DISCONNECTED': {
          alert('Party Host has disconnected.');
          setPartyStage('LOBBY');
          break;
        }

        default:
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  // --- HOST INTERNAL GAME LOGIC ---
  const handleHostCreate = (name) => {
    setIsHost(true);
    setMyPlayerName(name);
    const { roomCode: code, myPlayerId: id } = partyNetwork.createRoom(name);
    setRoomCode(code);
    setMyPlayerId(id);
    const hostPlayer = { id, name, isHost: true };
    hostGameRef.current.players = [hostPlayer];
    setConnectedPlayers([hostPlayer]);
  };

  const handleJoinRoom = (code, name) => {
    setIsHost(false);
    setMyPlayerName(name);
    const { roomCode: c, myPlayerId: id } = partyNetwork.joinRoom(code, name);
    setRoomCode(c);
    setMyPlayerId(id);
  };

  const handleStartPartyGame = (config) => {
    if (!partyNetwork.isHost) return;
    const h = hostGameRef.current;
    const { imposterCount, packId, customPair } = config;

    const pair = customPair || getRandomWordPair(packId);
    h.wordPair = pair;
    h.imposterCount = imposterCount;

    // Pick imposters randomly
    const total = h.players.length;
    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const imposterIndices = new Set(indices.slice(0, imposterCount));

    // Assign roles to alivePlayers
    h.alivePlayers = h.players.map((p, idx) => {
      const isImposter = imposterIndices.has(idx);
      return {
        id: p.id,
        name: p.name,
        isImposter,
        word: isImposter ? pair.imposter : pair.civilian,
        isEliminated: false
      };
    });

    h.readyPlayers.clear();
    h.roundNumber = 1;
    h.roundClues = [];
    h.allClues = [];

    // Broadcast Game Start
    partyNetwork.broadcast({
      type: 'GAME_STARTED',
      wordPair: pair
    });

    // Send private role data to each player
    h.alivePlayers.forEach(p => {
      partyNetwork.sendToPlayer(p.id, {
        type: 'ASSIGN_ROLE',
        roleData: {
          isImposter: p.isImposter,
          word: p.word
        }
      });
    });
  };

  const startPartyClueRoundInternal = () => {
    const h = hostGameRef.current;
    // Shuffle turn order among alive players
    const order = [...h.alivePlayers];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    h.turnOrder = order;
    h.turnIndex = 0;
    h.roundClues = [];

    partyNetwork.broadcast({
      type: 'START_CLUE_ROUND',
      firstTurnPlayerId: order[0].id
    });
  };

  const resolvePartyDecisionInternal = () => {
    const h = hostGameRef.current;
    const votes = Object.values(h.decisionVotes);
    const continueVotes = votes.filter(v => v === 'CONTINUE').length;
    const voteOutVotes = votes.filter(v => v === 'VOTE').length;

    // Majority decisions (tie goes to Proceed to Vote Out)
    if (continueVotes > voteOutVotes) {
      // Another Clue Round
      h.roundNumber = (h.roundNumber || 1) + 1;
      startPartyClueRoundInternal();
    } else {
      // Proceed to Vote Out -> 3-minute discussion
      partyNetwork.broadcast({
        type: 'START_3MIN_DISCUSSION'
      });
      // Start synchronized timer
      let timeLeft = 180;
      if (h.discussionTimer) clearInterval(h.discussionTimer);
      h.discussionTimer = setInterval(() => {
        timeLeft -= 1;
        partyNetwork.broadcast({
          type: 'SYNC_3MIN_TIMER',
          seconds: timeLeft
        });
        if (timeLeft <= 0) {
          clearInterval(h.discussionTimer);
          partyNetwork.broadcast({
            type: 'START_PARTY_VOTING'
          });
        }
      }, 1000);
    }
  };

  const resolvePartyVotingInternal = () => {
    const h = hostGameRef.current;
    if (h.discussionTimer) clearInterval(h.discussionTimer);

    // Tally votes
    const tally = {};
    Object.values(h.ballots).forEach(targetId => {
      tally[targetId] = (tally[targetId] || 0) + 1;
    });

    let maxVotes = -1;
    let eliminatedId = null;
    for (const [id, count] of Object.entries(tally)) {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = id;
      }
    }

    if (!eliminatedId && h.alivePlayers.length > 0) {
      eliminatedId = h.alivePlayers[0].id;
    }

    const eliminatedPlayer = h.alivePlayers.find(p => p.id === eliminatedId);
    h.alivePlayers = h.alivePlayers.filter(p => p.id !== eliminatedId);

    const remainingImposters = h.alivePlayers.filter(p => p.isImposter).length;
    const remainingCivilians = h.alivePlayers.filter(p => !p.isImposter).length;

    let isGameOver = false;
    let winner = null;

    if (remainingImposters === 0) {
      isGameOver = true;
      winner = 'civilians';
    } else if (remainingCivilians <= remainingImposters) {
      isGameOver = true;
      winner = 'imposters';
    }

    h.isGameOver = isGameOver;
    h.winner = winner;

    partyNetwork.broadcast({
      type: 'PARTY_ELIMINATION_REVEAL',
      eliminatedPlayer,
      remainingImposters,
      remainingAliveCount: h.alivePlayers.length,
      isGameOver,
      winner
    });
  };

  // Party player actions
  const handleConfirmMemorized = () => {
    setHasMemorized(true);
    partyNetwork.sendToHost({
      type: 'PLAYER_CONFIRMED_MEMORIZE',
      playerId: myPlayerId
    });
  };

  const handleSubmitClue = (text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const clueObj = {
      id: `clue-${myPlayerId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      playerId: myPlayerId,
      playerName: myPlayerName,
      text: cleanText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (partyNetwork.isHost) {
      const h = hostGameRef.current;
      h.roundClues.push(clueObj);
      h.allClues.push(clueObj);

      partyNetwork.broadcast({
        type: 'NEW_CLUE_BROADCAST',
        clue: clueObj
      });

      h.turnIndex += 1;
      if (h.turnIndex < h.turnOrder.length) {
        const nextPlayerId = h.turnOrder[h.turnIndex].id;
        partyNetwork.broadcast({
          type: 'TURN_CHANGED',
          nextTurnPlayerId: nextPlayerId
        });
      } else {
        setTimeout(() => {
          h.decisionVotes = {};
          partyNetwork.broadcast({
            type: 'START_ROUND_DECISION',
            roundNumber: h.roundNumber || 1
          });
        }, 1200);
      }
    } else {
      // Optimistically show on sender's screen immediately
      setCluesFeed(prev => {
        if (prev.some(c => c.id === clueObj.id)) return prev;
        return [...prev, clueObj];
      });
      setCluesHistory(prev => {
        if (prev.some(c => c.id === clueObj.id)) return prev;
        return [...prev, clueObj];
      });

      partyNetwork.sendToHost({
        type: 'CLUE_SUBMITTED_BY_PLAYER',
        clue: clueObj,
        playerId: myPlayerId,
        playerName: myPlayerName,
        text: cleanText
      });
    }
  };

  const handleCastDecisionVote = (choice) => {
    setHasVotedDecision(true);
    partyNetwork.sendToHost({
      type: 'CAST_DECISION_VOTE',
      playerId: myPlayerId,
      choice
    });
  };

  const handleSendTypingStatus = (isTyping) => {
    const payload = {
      type: 'PLAYER_TYPING',
      playerId: myPlayerId,
      playerName: myPlayerName,
      isTyping
    };
    if (partyNetwork.isHost) {
      partyNetwork.broadcast(payload, false);
    } else {
      partyNetwork.sendToHost(payload);
    }
  };

  const handleSendPartyChatMessage = (text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const chatMsg = {
      id: `chat-${myPlayerId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      playerId: myPlayerId,
      playerName: myPlayerName,
      text: cleanText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistically add to own chat feed immediately
    setPartyDiscussionChatFeed(prev => {
      if (prev.some(m => m.id === chatMsg.id)) return prev;
      return [...prev, chatMsg];
    });

    // Notify others that this player stopped typing
    handleSendTypingStatus(false);

    if (partyNetwork.isHost) {
      partyNetwork.broadcast({
        type: 'DISCUSSION_CHAT_MESSAGE',
        chatMsg
      }, false);
    } else {
      partyNetwork.sendToHost({
        type: 'DISCUSSION_CHAT_MESSAGE',
        chatMsg
      });
    }
  };

  const handleCastPartyVote = (targetId) => {
    setHasVotedParty(true);
    partyNetwork.sendToHost({
      type: 'SUBMIT_BALLOT',
      voterId: myPlayerId,
      targetId
    });
  };

  const handleProceedAfterPartyReveal = () => {
    if (!partyNetwork.isHost) return;
    const h = hostGameRef.current;
    if (h.isGameOver) {
      partyNetwork.broadcast({
        type: 'PARTY_GAME_OVER_STAGE'
      });
    } else {
      h.roundNumber = (h.roundNumber || 1) + 1;
      startPartyClueRoundInternal();
    }
  };

  // --- LOCAL PLAY HANDLERS ---
  const handleStartLocalGame = (config) => {
    setLocalLastConfig(config);
    const { playerNames, imposterCount, timerSeconds = 300, packId, customPair } = config;

    setLocalTotalGameTime(timerSeconds);
    setLocalRemainingTime(timerSeconds);

    const pair = customPair || getRandomWordPair(packId);
    setLocalWordPair(pair);

    const total = playerNames.length;
    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const imposterIndices = new Set(indices.slice(0, imposterCount));

    const initialized = playerNames.map((name, index) => {
      const isImposter = imposterIndices.has(index);
      return {
        id: `player-${index}-${Date.now()}`,
        name,
        isImposter,
        word: isImposter ? pair.imposter : pair.civilian,
        isEliminated: false
      };
    });

    setLocalPlayers(initialized);
    setLocalCurrentRevealIndex(0);
    setLocalRoundNumber(1);
    setLocalWinner(null);
    setLocalEliminatedModalData(null);
    setLocalStage('PASS_REVEAL');
  };

  const handleLocalNextReveal = () => {
    setLocalCurrentRevealIndex(prev => prev + 1);
  };

  const handleLocalAllRevealed = () => {
    const randomStarter = localPlayers[Math.floor(Math.random() * localPlayers.length)];
    setLocalStarterPlayer(randomStarter);
    setLocalStage('DISCUSSION');
  };

  const handleLocalConfirmVote = (votedPlayer) => {
    const updated = localPlayers.map(p => 
      p.id === votedPlayer.id ? { ...p, isEliminated: true } : p
    );
    setLocalPlayers(updated);

    const alive = updated.filter(p => !p.isEliminated);
    const aliveImposters = alive.filter(p => p.isImposter);
    const aliveCivilians = alive.filter(p => !p.isImposter);

    let winner = null;
    let gameOver = false;

    if (aliveImposters.length === 0) {
      winner = 'civilians';
      gameOver = true;
    } else if (aliveCivilians.length <= aliveImposters.length) {
      winner = 'imposters';
      gameOver = true;
    }

    setLocalWinner(winner);
    setLocalEliminatedModalData({
      player: votedPlayer,
      remainingImposters: aliveImposters.length,
      remainingAliveCount: alive.length,
      isGameOver: gameOver,
      winner
    });
  };

  const handleLocalProceedAfterReveal = () => {
    if (!localEliminatedModalData) return;
    const { isGameOver } = localEliminatedModalData;
    setLocalEliminatedModalData(null);

    if (isGameOver) {
      setLocalStage('GAME_OVER');
    } else {
      const alive = localPlayers.filter(p => !p.isEliminated);
      const nextStarter = alive[Math.floor(Math.random() * alive.length)];
      setLocalStarterPlayer(nextStarter);
      setLocalRoundNumber(prev => prev + 1);
      setLocalStage('DISCUSSION');
    }
  };

  const handleExitToModes = () => {
    sound.play('click');
    partyNetwork.disconnect();
    setGameMode('SELECT_MODE');
    setPartyStage('LOBBY');
    setRoomCode(null);
    setLocalStage('SETUP');
  };

  const localAlivePlayers = localPlayers.filter(p => !p.isEliminated);

  return (
    <div className={styles.phoneFrame}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div 
          onClick={handleBrandClick}
          role="button"
          tabIndex={0}
          title="DELTA: Undercover"
        >
          <DeltaLogo variant="header" />
        </div>

        <div className={styles.topActions}>
          <button 
            className={`${styles.iconBtn} ${isMuted ? styles.iconBtnMuted : ''}`}
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button 
            className={styles.iconBtn}
            onClick={() => setRulesOpen(true)}
            aria-label="How to Play"
          >
            <HelpCircle size={17} />
          </button>

          {gameMode !== 'SELECT_MODE' && (
            <button 
              className={styles.iconBtn}
              onClick={handleExitToModes}
              aria-label="Switch Game Mode"
              title="Switch Game Mode"
            >
              <RotateCcw size={17} />
            </button>
          )}
        </div>
      </header>

      {/* Screen View */}
      <main className={styles.screenView}>
        {/* MODE SELECTOR */}
        {gameMode === 'SELECT_MODE' && (
          <ModeSelector onSelectMode={(mode) => setGameMode(mode)} />
        )}

        {/* 1. LOCAL PLAY (PASS & PLAY) */}
        {gameMode === 'LOCAL' && (
          <>
            {localStage === 'SETUP' && (
              <Setup onStartGame={handleStartLocalGame} />
            )}

            {localStage === 'PASS_REVEAL' && localPlayers.length > 0 && (
              <PassReveal
                players={localPlayers}
                currentIndex={localCurrentRevealIndex}
                onNextPlayer={handleLocalNextReveal}
                onAllRevealed={handleLocalAllRevealed}
              />
            )}

            {localStage === 'DISCUSSION' && localStarterPlayer && (
              <Discussion
                roundNumber={localRoundNumber}
                starterPlayer={localStarterPlayer}
                alivePlayers={localAlivePlayers}
                totalGameTime={localTotalGameTime}
                remainingTime={localRemainingTime}
                onUpdateTime={setLocalRemainingTime}
                onProceedToVote={() => setLocalStage('VOTING')}
              />
            )}

            {localStage === 'VOTING' && (
              <Voting
                alivePlayers={localAlivePlayers}
                onConfirmVote={handleLocalConfirmVote}
                onBackToDiscussion={() => setLocalStage('DISCUSSION')}
              />
            )}

            {localStage === 'GAME_OVER' && (
              <GameOver
                winner={localWinner}
                wordPair={localWordPair}
                onPlayAgain={() => localLastConfig && handleStartLocalGame(localLastConfig)}
                onNewSetup={() => setLocalStage('SETUP')}
              />
            )}
          </>
        )}

        {/* 2. PARTY PLAY (ONLINE SYNCED ROOM) */}
        {gameMode === 'PARTY' && (
          <>
            {partyStage === 'LOBBY' && (
              <PartyLobby
                isHost={isHost}
                myPlayerId={myPlayerId}
                roomCode={roomCode}
                connectedPlayers={connectedPlayers}
                onHostCreate={handleHostCreate}
                onJoinRoom={handleJoinRoom}
                onStartPartyGame={handleStartPartyGame}
                onBackToHome={handleExitToModes}
              />
            )}

            {partyStage === 'SECRET_REVEAL' && (
              <PartySecretReveal
                myRoleData={myRoleData}
                readyCount={partyReadyCount}
                totalPlayers={connectedPlayers.length}
                hasConfirmedMemorized={hasMemorized}
                isHost={isHost}
                onConfirmMemorized={handleConfirmMemorized}
                onForceStartClueRound={startPartyClueRoundInternal}
              />
            )}

            {partyStage === 'CLUE_ROUND' && (
              <PartyClueRound
                roundNumber={partyRoundNumber}
                myPlayerId={myPlayerId}
                currentTurnPlayerId={currentTurnPlayerId}
                alivePlayers={connectedPlayers}
                cluesFeed={cluesFeed}
                myWord={myRoleData?.word}
                typingUsers={partyTypingUsers}
                onTyping={handleSendTypingStatus}
                onSubmitClue={handleSubmitClue}
              />
            )}

            {partyStage === 'ROUND_DECISION' && (
              <PartyRoundDecision
                roundNumber={partyRoundNumber}
                myPlayerId={myPlayerId}
                alivePlayers={connectedPlayers}
                decisionVotes={decisionVotes}
                hasVoted={hasVotedDecision}
                isHost={isHost}
                onCastDecisionVote={handleCastDecisionVote}
                onForceResolveDecision={resolvePartyDecisionInternal}
              />
            )}

            {partyStage === 'DISCUSSION_3MIN' && (
              <PartyDiscussion3Min
                myPlayerId={myPlayerId}
                myPlayerName={myPlayerName}
                alivePlayers={connectedPlayers}
                cluesHistory={cluesHistory}
                discussionChatFeed={partyDiscussionChatFeed}
                remainingSeconds={partyDiscussion3MinSeconds}
                isHost={isHost}
                typingUsers={partyTypingUsers}
                onTyping={handleSendTypingStatus}
                onSendChatMessage={handleSendPartyChatMessage}
                onTimeExpired={() => {
                  if (partyNetwork.isHost) {
                    partyNetwork.broadcast({ type: 'START_PARTY_VOTING' });
                  }
                }}
                onSkipToVoteEarly={() => {
                  if (partyNetwork.isHost) {
                    partyNetwork.broadcast({ type: 'START_PARTY_VOTING' });
                  }
                }}
              />
            )}

            {partyStage === 'VOTING' && (
              <PartyVoting
                myPlayerId={myPlayerId}
                alivePlayers={connectedPlayers}
                votedPlayersCount={Object.keys(votingBallots).length}
                hasVoted={hasVotedParty}
                isHost={isHost}
                onCastVote={handleCastPartyVote}
                onForceResolveVoting={resolvePartyVotingInternal}
              />
            )}

            {partyStage === 'GAME_OVER' && (
              <GameOver
                winner={partyWinner}
                wordPair={partyWordPair}
                onPlayAgain={() => {
                  if (isHost) {
                    setPartyStage('LOBBY');
                  }
                }}
                onNewSetup={handleExitToModes}
              />
            )}
          </>
        )}
      </main>

      {/* Local Elimination Modal */}
      {localEliminatedModalData && (
        <RevealModal
          eliminatedPlayer={localEliminatedModalData.player}
          remainingImposters={localEliminatedModalData.remainingImposters}
          remainingAliveCount={localEliminatedModalData.remainingAliveCount}
          isGameOver={localEliminatedModalData.isGameOver}
          onProceed={handleLocalProceedAfterReveal}
        />
      )}

      {/* Party Elimination Modal */}
      {partyEliminatedModalData && (
        <RevealModal
          eliminatedPlayer={partyEliminatedModalData.player}
          remainingImposters={partyEliminatedModalData.remainingImposters}
          remainingAliveCount={partyEliminatedModalData.remainingAliveCount}
          isGameOver={partyEliminatedModalData.isGameOver}
          onProceed={handleProceedAfterPartyReveal}
        />
      )}

      {/* Footer Credits */}
      <footer 
        className={styles.metaFooter}
        onClick={() => setDevModalOpen(true)}
        role="button"
        tabIndex={0}
      >
        <span>DELTA: Undercover</span>
        <span>•</span>
        <span>By Dhruv Itwala</span>
      </footer>

      {/* Rules Modal */}
      {rulesOpen && (
        <RulesModal onClose={() => setRulesOpen(false)} />
      )}

      {/* Developer Profile Modal */}
      {devModalOpen && (
        <DeveloperModal onClose={() => setDevModalOpen(false)} />
      )}
    </div>
  );
}
