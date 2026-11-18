import React, { useEffect } from 'react';
import { Trophy, Skull, RotateCcw, Sliders, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';
import styles from './GameOver.module.css';

export default function GameOver({
  winner,
  wordPair,
  onPlayAgain,
  onNewSetup
}) {
  const isCivilians = winner === 'civilians';

  useEffect(() => {
    if (isCivilians) {
      sound.play('civiliansWin');
      const end = Date.now() + 2.5 * 1000;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      sound.play('imposterWins');
    }
  }, [isCivilians]);

  return (
    <div className={styles.container}>
      {/* Banner */}
      <div className={`${styles.banner} ${isCivilians ? styles.civiliansBanner : styles.impostersBanner}`}>
        <div className={styles.trophyWrap}>
          {isCivilians ? (
            <Trophy size={42} className={styles.trophyIcon} />
          ) : (
            <Skull size={42} className={styles.skullIcon} />
          )}
        </div>
        <span className={styles.bannerSub}>Mission Concluded</span>
        <h1 className={styles.bannerTitle}>
          {isCivilians ? 'CIVILIANS TRIUMPH' : 'IMPOSTER DOMINATION'}
        </h1>
        <p className={styles.bannerDesc}>
          {isCivilians 
            ? 'The undercover threat was uncovered and successfully neutralized.'
            : 'The imposter successfully evaded detection and survived to the final showdown.'}
        </p>
      </div>

      {/* Words Comparison Card */}
      <div className={styles.wordsCard}>
        <div className={styles.wordBox}>
          <span className={styles.wordRole}>Civilians' Word</span>
          <span className={styles.wordTitle}>{wordPair.civilian}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.wordBox}>
          <span className={styles.wordRole}>Imposter's Word</span>
          <span className={`${styles.wordTitle} ${styles.imposterWord}`}>
            {wordPair.imposter}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button 
          className={styles.playAgainBtn}
          onClick={() => {
            sound.play('start');
            onPlayAgain();
          }}
        >
          <RotateCcw size={16} />
          <span>Play Again (Same Operatives)</span>
        </button>

        <button 
          className={styles.newSetupBtn}
          onClick={() => {
            sound.play('click');
            onNewSetup();
          }}
        >
          <Sliders size={16} />
          <span>Adjust Players & Word Packs</span>
        </button>
      </div>
    </div>
  );
}
