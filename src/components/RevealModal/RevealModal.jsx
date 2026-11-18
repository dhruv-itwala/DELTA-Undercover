import React, { useEffect } from 'react';
import { Skull, ShieldCheck, ArrowRight, ShieldAlert, Users, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';
import styles from './RevealModal.module.css';

export default function RevealModal({
  eliminatedPlayer,
  remainingImposters,
  remainingAliveCount,
  isGameOver,
  onProceed
}) {
  const isImposter = eliminatedPlayer.isImposter;

  useEffect(() => {
    if (isImposter) {
      sound.play('imposterBusted');
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } else {
      sound.play('innocentLost');
    }
  }, [isImposter]);

  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${isImposter ? styles.imposterBusted : styles.civilianLost}`}>
        {/* Animated Badge */}
        <div className={styles.iconContainer}>
          {isImposter ? (
            <Skull size={48} className={styles.bustedIcon} />
          ) : (
            <ShieldCheck size={48} className={styles.lostIcon} />
          )}
        </div>

        <span className={styles.subTitle}>Ballot Result</span>
        <h2 className={styles.playerName}>{eliminatedPlayer.name}</h2>
        <span className={styles.eliminatedTag}>Eliminated from Game</span>

        {/* Verdict Box */}
        <div className={styles.verdictBox}>
          {isImposter ? (
            <>
              <div className={styles.verdictHeader}>
                <ShieldAlert size={18} />
                <span className={styles.verdictStatus}>IMPOSTER BUSTED</span>
              </div>
              <p className={styles.verdictText}>
                They were successfully identified as an undercover imposter!
              </p>
            </>
          ) : (
            <>
              <div className={styles.verdictHeaderCivilian}>
                <ShieldCheck size={18} />
                <span className={styles.verdictStatusCivilian}>INNOCENT CIVILIAN</span>
              </div>
              <p className={styles.verdictText}>
                A loyal civilian operative was mistakenly eliminated!
              </p>
            </>
          )}

          <div className={styles.wordReveal}>
            Their assigned secret word was: <span className={styles.word}>{eliminatedPlayer.word}</span>
          </div>
        </div>

        {/* Game State Summary */}
        <div className={styles.statusRow}>
          <div className={styles.statusPill}>
            <Users size={13} />
            <span>Active: <strong>{remainingAliveCount}</strong></span>
          </div>
          <div className={styles.statusPill}>
            <Skull size={13} />
            <span>Imposters Remaining: <strong>{remainingImposters}</strong></span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className={styles.proceedBtn}
          onClick={() => {
            sound.play('click');
            onProceed();
          }}
        >
          <span>{isGameOver ? 'View Final Results' : 'Proceed to Next Round'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
