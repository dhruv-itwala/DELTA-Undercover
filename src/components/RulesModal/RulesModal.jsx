import React from 'react';
import { X, HelpCircle, Shield, UserX, MessageSquare, Vote, Trophy, VenetianMask } from 'lucide-react';
import styles from './RulesModal.module.css';

export default function RulesModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.iconWrap}>
              <VenetianMask className={styles.icon} size={18} />
            </div>
            <h2>Protocol Briefing</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.step}>
            <div className={styles.badge}><Shield size={15} /></div>
            <div>
              <h3>1. Secret Assignments</h3>
              <p>Hand the device to each player. <strong>Civilians</strong> receive the baseline secret word (e.g. <em>Door</em>). The <strong>Imposter</strong> receives a similar word (e.g. <em>Wardrobe</em>) with an imposter alert.</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.badge}><MessageSquare size={15} /></div>
            <div>
              <h3>2. Covert Clues & Discussion</h3>
              <p>The chosen starter begins. In clockwise order, each operative states <strong>one concise clue</strong> proving they hold the civilian word without making it obvious to the imposter.</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.badge}><Vote size={15} /></div>
            <div>
              <h3>3. Elimination Vote</h3>
              <p>Debate suspicious descriptions. Once ready, tap <strong>Proceed to Vote Out</strong> and submit the operative agreed upon by consensus.</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.badge}><Trophy size={15} /></div>
            <div>
              <h3>4. Win Conditions</h3>
              <p>
                <strong>Civilians Win:</strong> When all imposters are eliminated.<br />
                <strong>Imposter Wins:</strong> If an innocent civilian is voted out and only 2 operatives remain (1 civilian + 1 imposter).
              </p>
            </div>
          </div>
        </div>

        <button className={styles.gotItBtn} onClick={onClose}>
          Understood, Return to Game
        </button>
      </div>
    </div>
  );
}
