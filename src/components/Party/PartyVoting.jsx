import React, { useState } from 'react';
import { Vote, CheckCircle2, UserX, Skull, ArrowRight, Check } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './PartyVoting.module.css';

const AVATAR_COLORS = [
  '#f43f5e', '#06b6d4', '#10b981', '#f59e0b',
  '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'
];

export default function PartyVoting({
  myPlayerId,
  alivePlayers,
  votedPlayersCount,
  hasVoted,
  isHost,
  onCastVote,
  onForceResolveVoting
}) {
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedPlayer = alivePlayers.find(p => p.id === selectedTargetId);
  const totalAlive = alivePlayers.length;

  const handleSelect = (playerId) => {
    if (hasVoted) return;
    sound.play('click');
    setSelectedTargetId(playerId);
  };

  const handleInitiate = () => {
    if (!selectedTargetId) return;
    sound.play('click');
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    if (!selectedPlayer) return;
    setShowConfirmModal(false);
    onCastVote(selectedPlayer.id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Vote size={12} />
          <span>INDIVIDUAL SECRET BALLOT</span>
        </div>
        <h1 className={styles.title}>Cast Your Vote</h1>
        <p className={styles.subtitle}>
          Select the operative you believe is the Imposter. Each player's ballot is cast privately.
        </p>
      </div>

      {/* Roster of suspects */}
      <div className={styles.playerGrid}>
        {alivePlayers.map((player, idx) => {
          const isSelected = player.id === selectedTargetId;
          const isMe = player.id === myPlayerId;
          return (
            <div
              key={player.id}
              className={`${styles.playerCard} ${isSelected ? styles.playerSelected : ''} ${hasVoted ? styles.cardLocked : ''}`}
              onClick={() => handleSelect(player.id)}
              role="button"
              tabIndex={0}
            >
              <div 
                className={styles.avatar}
                style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>

              <div className={styles.playerInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.playerName}>{player.name}</span>
                  {isMe && <span className={styles.youBadge}>YOU</span>}
                </div>
                <span className={styles.status}>Active Suspect</span>
              </div>

              <div className={styles.radioIndicator}>
                {isSelected && <CheckCircle2 size={18} className={styles.checkIcon} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {!hasVoted ? (
        <button
          disabled={!selectedTargetId}
          className={`${styles.submitBtn} ${!selectedTargetId ? styles.disabledBtn : ''}`}
          onClick={handleInitiate}
        >
          <UserX size={18} />
          <span>
            {selectedPlayer ? `Vote Out ${selectedPlayer.name}` : 'Select an Operative'}
          </span>
        </button>
      ) : (
        <div className={styles.votedNotice}>
          <div className={styles.votedCheck}>
            <Check size={16} />
          </div>
          <div>
            <span className={styles.votedTitle}>Your Secret Vote is Cast</span>
            <p className={styles.votedSub}>Tallying results ({votedPlayersCount} / {totalAlive} ballots submitted)...</p>
          </div>
        </div>
      )}

      {/* Host Force Resolution */}
      {isHost && (
        <button className={styles.hostForceBtn} onClick={onForceResolveVoting}>
          <span>Resolve Votes Now ({votedPlayersCount}/{totalAlive})</span>
          <ArrowRight size={15} />
        </button>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlayer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIconWrap}>
              <Skull size={28} className={styles.skullIcon} />
            </div>
            <h2 className={styles.modalTitle}>Confirm Elimination Vote</h2>
            <p className={styles.modalText}>
              Are you sure you want to cast your ballot to eliminate <strong>{selectedPlayer.name}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => {
                  sound.play('click');
                  setShowConfirmModal(false);
                }}
              >
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleFinalConfirm}>
                Confirm Ballot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

