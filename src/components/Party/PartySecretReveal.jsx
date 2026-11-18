import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Skull, Check, Lock, Fingerprint, AlertTriangle, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './PartySecretReveal.module.css';

export default function PartySecretReveal({
  myRoleData, // { isImposter, word }
  readyCount,
  totalPlayers,
  hasConfirmedMemorized,
  isHost,
  onConfirmMemorized,
  onForceStartClueRound
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleReveal = () => {
    if (!isRevealed) {
      sound.play('reveal');
      setIsRevealed(true);
    } else {
      sound.play('click');
      setIsRevealed(false);
    }
  };

  const handleMemorize = () => {
    sound.play('click');
    onConfirmMemorized();
  };

  const isImposter = myRoleData?.isImposter;

  return (
    <div className={styles.container}>
      <div className={styles.topStatus}>
        <span className={styles.statusLabel}>CONFIDENTIAL DISCLOSURE</span>
        <div className={styles.readyPill}>
          <Check size={12} />
          <span>{readyCount} / {totalPlayers} Operatives Ready</span>
        </div>
      </div>

      <div className={styles.instructionBox}>
        <h2 className={styles.title}>Your Secret Assignment</h2>
        <p className={styles.sub}>
          Only you can see this screen. Memorize your word before the clue round begins!
        </p>
      </div>

      {/* Secret Card */}
      <div 
        className={`${styles.card} ${isRevealed ? styles.cardRevealed : styles.cardHidden} ${isRevealed && isImposter ? styles.imposterCard : ''}`}
        onClick={toggleReveal}
        role="button"
        tabIndex={0}
      >
        {!isRevealed ? (
          <div className={styles.hiddenContent}>
            <div className={styles.scanIconWrap}>
              <Fingerprint size={48} className={styles.fingerprintIcon} />
            </div>
            <span className={styles.tapPrompt}>Tap to View Secret Word</span>
            <span className={styles.tapSub}>Do not let other players see your phone!</span>
          </div>
        ) : (
          <div className={styles.revealedContent}>
            {isImposter ? (
              <div className={styles.imposterBadge}>
                <AlertTriangle size={18} />
                <span>YOU ARE THE IMPOSTER</span>
                <AlertTriangle size={18} />
              </div>
            ) : (
              <div className={styles.civilianBadge}>
                <Shield size={16} />
                <span>Civilian Operative</span>
              </div>
            )}

            <div className={styles.wordSection}>
              <span className={styles.wordLabel}>Your Assigned Word:</span>
              <span className={styles.theWord}>{myRoleData?.word}</span>
            </div>

            <p className={styles.briefingText}>
              {isImposter 
                ? "Your word is slightly different from civilians. Pretend you hold their word and avoid detection!"
                : "Civilians hold this exact word. When it's your turn to type a clue, give a subtle hint proving your loyalty."}
            </p>

            <div className={styles.tapToHide}>
              <EyeOff size={14} />
              <span>Tap card to conceal</span>
            </div>
          </div>
        )}
      </div>

      {/* Memorized Confirmation */}
      {!hasConfirmedMemorized ? (
        <button className={styles.memorizeBtn} onClick={handleMemorize}>
          <Check size={18} />
          <span>I Have Memorized My Word</span>
        </button>
      ) : (
        <div className={styles.confirmedBox}>
          <div className={styles.checkCircle}>
            <Check size={16} />
          </div>
          <div>
            <span className={styles.confirmedTitle}>Ready for Clue Round</span>
            <p className={styles.confirmedSub}>Waiting for other operatives ({readyCount}/{totalPlayers})...</p>
          </div>
        </div>
      )}

      {/* Host Force Start Option if someone is slow */}
      {isHost && (
        <button className={styles.hostForceBtn} onClick={onForceStartClueRound}>
          <span>Start Clue Round Now</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

