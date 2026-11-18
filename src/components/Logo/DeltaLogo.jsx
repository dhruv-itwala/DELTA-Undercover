import React from 'react';
import styles from './DeltaLogo.module.css';

export default function DeltaLogo({ 
  variant = 'header', // 'header' | 'flaticon' | 'square' | 'landscape'
  size = 'medium',
  className = ''
}) {
  if (variant === 'flaticon') {
    return (
      <div className={`${styles.flaticonWrap} ${styles[size]} ${className}`}>
        <img 
          src="/logo-flaticon.png" 
          alt="DELTA: Undercover Icon" 
          className={styles.flaticonImg} 
        />
      </div>
    );
  }

  if (variant === 'square') {
    return (
      <div className={`${styles.squareWrap} ${className}`}>
        <img 
          src="/logo-square.png" 
          alt="DELTA: Undercover Portrait Logo" 
          className={styles.squareImg} 
        />
      </div>
    );
  }

  if (variant === 'landscape') {
    return (
      <div className={`${styles.landscapeWrap} ${className}`}>
        <img 
          src="/logo-landscape.png" 
          alt="DELTA: Undercover Banner Logo" 
          className={styles.landscapeImg} 
        />
      </div>
    );
  }

  // Default 'header' version: Crisp flaticon avatar + Typography badge
  return (
    <div className={`${styles.headerLogo} ${className}`}>
      <div className={styles.avatarBadge}>
        <img 
          src="/logo-flaticon.png" 
          alt="DELTA Logo" 
          className={styles.headerAvatar} 
        />
      </div>
      <div className={styles.brandMeta}>
        <div className={styles.brandTitleRow}>
          <span className={styles.deltaText}>DELTA</span>
          <span className={styles.colon}>:</span>
          <span className={styles.undercoverText}>UNDERCOVER</span>
        </div>
        <span className={styles.brandTagline}>FIND THE IMPOSTER</span>
      </div>
    </div>
  );
}
