import React from 'react';
import { Smartphone, Users, Wifi, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';
import DeltaLogo from '../Logo/DeltaLogo';
import styles from './ModeSelector.module.css';

export default function ModeSelector({ onSelectMode }) {
  const handleSelect = (mode) => {
    sound.play('click');
    onSelectMode(mode);
  };

  return (
    <div className={styles.container}>
      {/* Hero Presentation */}
      {/* <div className={styles.heroSection}>
        <div className={styles.logoWrap}>
          <DeltaLogo variant="square" />
        </div>
        <p className={styles.heroSub}>Choose how your squad wants to play</p>
      </div> */}

      {/* Mode Cards */}
      <div className={styles.modeCardsGrid}>
        {/* Local Play Card */}
        <div 
          className={styles.modeCard} 
          onClick={() => handleSelect('LOCAL')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.cardHeader}>
            <div className={styles.iconCircleLocal}>
              <Smartphone size={24} />
            </div>
            <span className={styles.badgeLocal}>1 Device</span>
          </div>

          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Local Play</h2>
            <span className={styles.cardSubtitle}>Classic Pass & Play</span>
            <p className={styles.cardDesc}>
              Pass a single phone or laptop around your group in a circle. Fast, zero-lag, no connection needed.
            </p>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.actionText}>Launch Local Game</span>
            <ArrowRight size={16} className={styles.arrowIcon} />
          </div>
        </div>

        {/* Party Play Card */}
        <div 
          className={`${styles.modeCard} ${styles.partyCard}`} 
          onClick={() => handleSelect('PARTY')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.cardHeader}>
            <div className={styles.iconCircleParty}>
              <Wifi size={24} />
            </div>
            <span className={styles.badgeParty}>Online Synced</span>
          </div>

          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Party Play</h2>
            <span className={styles.cardSubtitle}>Multi-Device Room with Code</span>
            <p className={styles.cardDesc}>
              Host creates a party code. Friends join on their own phones with live clue chat, 3-min debate, and synchronized secret voting!
            </p>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.actionTextParty}>Host or Join Room</span>
            <ArrowRight size={16} className={styles.arrowIconParty} />
          </div>
        </div>
      </div>
    </div>
  );
}

