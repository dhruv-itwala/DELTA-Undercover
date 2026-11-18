import React, { useState } from 'react';
import { Vote, ArrowLeft, Skull, CheckCircle2, UserX, AlertTriangle } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './Voting.module.css';

const AVATAR_COLORS = [
  '#f43f5e', '#06b6d4', '#10b981', '#f59e0b',
  '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'
];

export default function Voting({
  alivePlayers,
  onConfirmVote,
  onBackToDiscussion
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedPlayer = alivePlayers.find(p => p.id === selectedPlayerId);

  const handleSelect = (playerId) => {
    sound.play('click');
    setSelectedPlayerId(playerId);
  };

  const handleInitiateVote = () => {
    if (!selectedPlayerId) return;
    sound.play('click');
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    if (!selectedPlayer) return;
    setShowConfirmModal(false);
    onConfirmVote(selectedPlayer);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backBtn}
          onClick={() => {
            sound.play('click');
            onBackToDiscussion();
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Debate</span>
        </button>

        <div className={styles.headerTitle}>
          <Vote className={styles.voteIcon} size={20} />
          <h1>Elimination Vote</h1>
        </div>
      </div>

      <p className={styles.description}>
        Select the operative suspected of carrying the altered word. Consensus is final.
      </p>

      {/* Players List */}
      <div className={styles.playerGrid}>
        {alivePlayers.map((player, idx) => {
          const isSelected = player.id === selectedPlayerId;
          return (
            <div
              key={player.id}
              className={`${styles.playerCard} ${isSelected ? styles.playerSelected : ''}`}
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
                <span className={styles.playerName}>{player.name}</span>
                <span className={styles.status}>Active Suspect</span>
              </div>

              <div className={styles.radioIndicator}>
                {isSelected && <CheckCircle2 size={18} className={styles.checkIcon} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        disabled={!selectedPlayerId}
        className={`${styles.submitBtn} ${!selectedPlayerId ? styles.disabledBtn : ''}`}
        onClick={handleInitiateVote}
      >
        <UserX size={18} />
        <span>
          {selectedPlayer ? `Vote Out ${selectedPlayer.name}` : 'Select a Suspect'}
        </span>
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlayer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIconWrap}>
              <Skull size={28} className={styles.skullIcon} />
            </div>
            <h2 className={styles.modalTitle}>Confirm Elimination</h2>
            <p className={styles.modalText}>
              Are you sure you want to eliminate <strong>{selectedPlayer.name}</strong>?
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
              <button className={styles.confirmBtn} onClick={handleFinalSubmit}>
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
