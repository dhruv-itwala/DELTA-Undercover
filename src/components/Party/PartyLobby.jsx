import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, Copy, Check, ArrowRight, ArrowLeft, Play, 
  ShieldAlert, Sparkles, AlertCircle, Wifi, RefreshCw, Smartphone
} from 'lucide-react';
import { WORD_PACKS } from '../../data/words';
import { sound } from '../../utils/audio';
import styles from './PartyLobby.module.css';

const AVATAR_COLORS = [
  '#f43f5e', '#06b6d4', '#10b981', '#f59e0b',
  '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'
];

export default function PartyLobby({
  partyState,
  isHost,
  myPlayerId,
  roomCode,
  connectedPlayers,
  onHostCreate,
  onJoinRoom,
  onStartPartyGame,
  onBackToHome
}) {
  const [tab, setTab] = useState('JOIN'); // 'JOIN' | 'CREATE'
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Host settings
  const [imposterCount, setImposterCount] = useState(1);
  const [selectedPack, setSelectedPack] = useState('all');
  const [customMode, setCustomMode] = useState(false);
  const [customCivilian, setCustomCivilian] = useState('');
  const [customImposter, setCustomImposter] = useState('');

  // Auto-fill room code from URL query param if present
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setInputCode(urlRoom.toUpperCase());
        setTab('JOIN');
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      sound.play('click');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your operative name');
      return;
    }
    sound.play('click');
    setError('');
    onHostCreate(playerName.trim());
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your operative name');
      return;
    }
    if (!inputCode.trim()) {
      setError('Please enter the 5-letter party room code');
      return;
    }
    sound.play('click');
    setError('');
    onJoinRoom(inputCode.trim().toUpperCase(), playerName.trim());
  };

  const handleLaunchGame = () => {
    if (connectedPlayers.length < 3) {
      setError('Need at least 3 players connected to start');
      return;
    }
    if (customMode) {
      if (!customCivilian.trim() || !customImposter.trim()) {
        setError('Please enter both Civilian and Imposter custom words');
        return;
      }
      if (customCivilian.trim().toLowerCase() === customImposter.trim().toLowerCase()) {
        setError('Words must be different!');
        return;
      }
    }

    sound.play('start');
    onStartPartyGame({
      imposterCount,
      packId: selectedPack,
      customPair: customMode ? {
        civilian: customCivilian.trim(),
        imposter: customImposter.trim()
      } : null
    });
  };

  const maxImposters = Math.max(1, Math.floor((connectedPlayers.length - 1) / 2));

  // --- SCREEN 1: PRE-LOBBY FORM (HOST OR JOIN) ---
  if (!roomCode) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Game Modes</span>
        </button>

        <div className={styles.hero}>
          <div className={styles.wifiBadge}>
            <Wifi size={14} />
            <span>Party Play Protocol</span>
          </div>
          <h1 className={styles.heroTitle}>Multiplayer Room</h1>
          <p className={styles.heroSub}>Connect multiple devices and play in live sync!</p>
        </div>

        {/* Tab Toggle */}
        <div className={styles.tabToggle}>
          <button 
            type="button"
            className={`${styles.tabBtn} ${tab === 'JOIN' ? styles.tabActive : ''}`}
            onClick={() => {
              sound.play('click');
              setTab('JOIN');
              setError('');
            }}
          >
            <span>Join with Code</span>
          </button>
          <button 
            type="button"
            className={`${styles.tabBtn} ${tab === 'CREATE' ? styles.tabActive : ''}`}
            onClick={() => {
              sound.play('click');
              setTab('CREATE');
              setError('');
            }}
          >
            <span>Create New Room</span>
          </button>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className={styles.card}>
          {tab === 'JOIN' ? (
            <form onSubmit={handleJoinSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Your Operative Name</label>
                <input
                  type="text"
                  placeholder="e.g. Agent Phoenix"
                  value={playerName}
                  maxLength={18}
                  onChange={(e) => setPlayerName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.inputGroup}>
                <label>5-Letter Room Code</label>
                <input
                  type="text"
                  placeholder="e.g. VIPER"
                  value={inputCode}
                  maxLength={6}
                  className={styles.codeInput}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                <span>Connect to Party</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Your Host Name</label>
                <input
                  type="text"
                  placeholder="e.g. Commander Nova"
                  value={playerName}
                  maxLength={18}
                  onChange={(e) => setPlayerName(e.target.value)}
                  autoFocus
                />
              </div>

              <p className={styles.hostNotice}>
                You will be the Party Host. You'll get a room code to share with friends and control mission settings.
              </p>

              <button type="submit" className={styles.submitBtn}>
                <span>Create Party Lobby</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- SCREEN 2: ACTIVE LOBBY ROOM ---
  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBackToHome}>
        <ArrowLeft size={16} />
        <span>Exit Party Room</span>
      </button>

      {/* Room Code Card */}
      <div className={styles.roomCodeCard}>
        <span className={styles.roomLabel}>MISSION ROOM CODE</span>
        <div className={styles.codeRow}>
          <span className={styles.codeDisplay}>{roomCode}</span>
          <button 
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
            onClick={handleCopyLink}
            title="Copy Invite Link"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Link Copied!' : 'Invite Link'}</span>
          </button>
        </div>
        <p className={styles.shareHint}>Share this code or link with friends to join on their phones!</p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Connected Operatives Roster */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <Users size={16} className={styles.cardIconCyan} />
            <span>Connected Operatives ({connectedPlayers.length})</span>
          </div>
          <span className={styles.hint}>Min 3 to launch</span>
        </div>

        <div className={styles.rosterList}>
          {connectedPlayers.map((player, idx) => {
            const isMe = player.id === myPlayerId;
            return (
              <div key={player.id} className={`${styles.rosterRow} ${isMe ? styles.rosterRowMe : ''}`}>
                <div 
                  className={styles.avatar} 
                  style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.rosterInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.pName}>{player.name}</span>
                    {isMe && <span className={styles.youBadge}>YOU</span>}
                  </div>
                  <span className={styles.readyStatus}>Connected & Ready</span>
                </div>
                {player.isHost && (
                  <span className={styles.hostBadge}>
                    <Crown size={12} />
                    <span>Host</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Mission Settings (Host Only) */}
      {isHost ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <ShieldAlert size={16} className={styles.cardIconDanger} />
              <span>Imposters Count</span>
            </div>
          </div>

          <div className={styles.pillGroup}>
            {[1, 2].map((num) => {
              const disabled = num > maxImposters;
              return (
                <button
                  key={num}
                  type="button"
                  disabled={disabled}
                  className={`${styles.pillBtn} ${imposterCount === num ? styles.activePillDanger : ''} ${disabled ? styles.disabledPill : ''}`}
                  onClick={() => {
                    sound.play('click');
                    setImposterCount(num);
                  }}
                >
                  <span className={styles.pillNumber}>{num}</span>
                  <span className={styles.pillLabel}>{num === 1 ? 'Imposter' : 'Imposters'}</span>
                  {disabled && <span className={styles.pillLock}>Requires 5+ players</span>}
                </button>
              );
            })}
          </div>

          {/* Word pack selector */}
          <div className={styles.packSelectHeader}>
            <div className={styles.cardTitle}>
              <Sparkles size={16} className={styles.cardIconCyan} />
              <span>Word Category</span>
            </div>
          </div>

          <div className={styles.packGrid}>
            <button
              type="button"
              className={`${styles.packBtn} ${selectedPack === 'all' ? styles.activePack : ''}`}
              onClick={() => {
                sound.play('click');
                setSelectedPack('all');
              }}
            >
              <span>All Mixed (230+)</span>
            </button>
            {WORD_PACKS.slice(0, 4).map(pack => (
              <button
                key={pack.id}
                type="button"
                className={`${styles.packBtn} ${selectedPack === pack.id ? styles.activePack : ''}`}
                onClick={() => {
                  sound.play('click');
                  setSelectedPack(pack.id);
                }}
              >
                <span>{pack.name}</span>
              </button>
            ))}
          </div>

          <button className={styles.launchBtn} onClick={handleLaunchGame}>
            <Play size={18} fill="currentColor" />
            <span>Launch Party Mission ({connectedPlayers.length}/3+)</span>
          </button>
        </div>
      ) : (
        /* Guest Waiting Card */
        <div className={styles.waitingCard}>
          <div className={styles.waitingRadar}>
            <RefreshCw size={24} className={styles.spinIcon} />
          </div>
          <h3 className={styles.waitingTitle}>Waiting for Host</h3>
          <p className={styles.waitingSub}>
            The host will configure the mission and launch when all operatives are connected.
          </p>
        </div>
      )}
    </div>
  );
}

