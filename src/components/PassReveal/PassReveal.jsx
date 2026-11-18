import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Skull, ArrowRight, AlertTriangle, Fingerprint, Lock } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './PassReveal.module.css';

export default function PassReveal({
  players,
  currentIndex,
  onNextPlayer,
  onAllRevealed
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const currentPlayer = players[currentIndex];
  const isLastPlayer = currentIndex === players.length - 1;

  const toggleReveal = () => {
    if (!isRevealed) {
      sound.play('reveal');
      setIsRevealed(true);
    } else {
      sound.play('click');
      setIsRevealed(false);
    }
  };

  const handleProceed = () => {
    sound.play('click');
    setIsRevealed(false);
    if (isLastPlayer) {
      onAllRevealed();
    } else {
      onNextPlayer();
    }
  };

  return (
    <div className={styles.container}>
      {/* Progress */}
      <div className={styles.progressRow}>
        <div className={styles.progressMeta}>
          <span className={styles.progressStep}>CONFIDENTIAL DISCLOSURE</span>
          <span className={styles.progressCount}>{currentIndex + 1} / {players.length}</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${((currentIndex + 1) / players.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Target Handover Instruction */}
      <div className={styles.targetBox}>
        <span className={styles.targetLabel}>Hand device to</span>
        <h2 className={styles.playerName}>{currentPlayer.name}</h2>
        <div className={styles.privacyBadge}>
          <Lock size={12} />
          <span>Screen must be hidden from others</span>
        </div>
      </div>

      {/* Interactive Secret Card */}
      <div 
        className={`${styles.card} ${isRevealed ? styles.cardRevealed : styles.cardHidden} ${isRevealed && currentPlayer.isImposter ? styles.cardImposter : ''}`}
        onClick={toggleReveal}
        role="button"
        tabIndex={0}
      >
        {!isRevealed ? (
          <div className={styles.hiddenView}>
            <div className={styles.scanIconWrap}>
              <Fingerprint size={48} className={styles.fingerprintIcon} />
            </div>
            <div className={styles.tapPrompt}>Tap Card to Reveal</div>
            <p className={styles.tapSub}>Keep screen angled away from nearby eyes</p>
          </div>
        ) : (
          <div className={styles.revealedView}>
            {currentPlayer.isImposter ? (
              <div className={styles.imposterBadge}>
                <AlertTriangle size={18} className={styles.imposterWarningIcon} />
                <span className={styles.imposterText}>YOU ARE THE IMPOSTER</span>
                <AlertTriangle size={18} className={styles.imposterWarningIcon} />
              </div>
            ) : (
              <div className={styles.civilianBadge}>
                <Shield size={16} className={styles.civilianIcon} />
                <span>Civilian Operative</span>
              </div>
            )}

            <div className={styles.wordSection}>
              <span className={styles.wordLabel}>Your Secret Word</span>
              <span className={styles.theWord}>{currentPlayer.word}</span>
            </div>

            <p className={styles.briefingText}>
              {currentPlayer.isImposter
                ? "Your word is slightly different from civilians. Act natural, blend in with their clues, and avoid getting voted out!"
                : "Civilians share this exact word. Give a brief, subtle clue when your turn comes to prove you belong."}
            </p>

            <div className={styles.tapToHide}>
              <EyeOff size={14} />
              <span>Tap card anytime to conceal</span>
            </div>
          </div>
        )}
      </div>

      {/* Proceed Navigation Button */}
      {isRevealed && (
        <button className={styles.actionBtn} onClick={handleProceed}>
          <span>{isLastPlayer ? 'All Operatives Ready - Begin Discussion' : `Hide & Pass to ${players[currentIndex + 1]?.name}`}</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}
