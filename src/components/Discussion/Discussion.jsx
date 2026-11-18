import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Vote, Sparkles, MessageSquare, Clock, Radio, UserCheck, AlertTriangle } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './Discussion.module.css';

export default function Discussion({
  roundNumber,
  starterPlayer,
  alivePlayers,
  remainingTime,
  onUpdateTime,
  onProceedToVote
}) {
  const [timerActive, setTimerActive] = useState(true); // Active by default
  const [starterRevealed, setStarterRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarterRevealed(true);
      sound.play('reveal');
    }, 400);
    return () => clearTimeout(timer);
  }, [starterPlayer]);

  useEffect(() => {
    let interval = null;
    if (timerActive && remainingTime > 0) {
      interval = setInterval(() => {
        onUpdateTime((prevTime) => {
          if (prevTime <= 6 && prevTime > 1) {
            sound.play('tick');
          }
          if (prevTime <= 1) {
            sound.play('innocentLost');
            setTimerActive(false);
            // Once timer is over, automatically proceed to voteout!
            setTimeout(() => {
              onProceedToVote();
            }, 600);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, remainingTime, onUpdateTime, onProceedToVote]);

  const toggleTimer = () => {
    sound.play('click');
    setTimerActive(!timerActive);
  };

  const starterIndex = alivePlayers.findIndex(p => p.id === starterPlayer.id);
  const orderedPlayers = starterIndex >= 0 
    ? [...alivePlayers.slice(starterIndex), ...alivePlayers.slice(0, starterIndex)]
    : alivePlayers;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const isUrgent = remainingTime <= 20;

  return (
    <div className={styles.container}>
      {/* Top Status & Overall Game Timer */}
      <div className={styles.topStatusRow}>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span>ROUND {roundNumber} DEBATE</span>
        </div>

        <div className={`${styles.timerChip} ${isUrgent ? styles.timerChipUrgent : ''}`}>
          <Clock size={13} className={isUrgent ? styles.urgentIcon : ''} />
          <span className={styles.timerChipText}>
            {minutes}:{(seconds).toString().padStart(2, '0')}
          </span>
          <button 
            className={styles.timerMiniToggle} 
            onClick={toggleTimer}
            aria-label={timerActive ? 'Pause Timer' : 'Resume Timer'}
          >
            {timerActive ? <Pause size={10} /> : <Play size={10} />}
          </button>
        </div>
      </div>

      {/* Starter Announcement Banner */}
      <div className={`${styles.starterCard} ${starterRevealed ? styles.starterShow : ''}`}>
        <div className={styles.radarEffect}>
          <Radio size={28} className={styles.radarIcon} />
        </div>
        <span className={styles.starterMeta}>Designated Starter</span>
        <h2 className={styles.starterName}>{starterPlayer.name}</h2>
        <p className={styles.starterTip}>
          Give 1 subtle clue or descriptive phrase about your word, then pass clockwise.
        </p>
      </div>

      {/* Speaking Order List */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <MessageSquare size={16} className={styles.cardIcon} />
            <span>Turn Order ({orderedPlayers.length} Active Operatives)</span>
          </div>
        </div>

        <div className={styles.orderList}>
          {orderedPlayers.map((player, idx) => (
            <div 
              key={player.id} 
              className={`${styles.playerItem} ${idx === 0 ? styles.firstPlayer : ''}`}
            >
              <div className={styles.orderNumber}>{idx + 1}</div>
              <div className={styles.playerName}>{player.name}</div>
              {idx === 0 ? (
                <span className={styles.starterBadge}>
                  <UserCheck size={12} />
                  <span>Speaks First</span>
                </span>
              ) : (
                <span className={styles.waitingBadge}>Turn {idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timer Countdown Card */}
      <div className={`${styles.timerCard} ${isUrgent ? styles.timerCardUrgent : ''}`}>
        <div className={styles.timerInfo}>
          <div className={styles.timerTitleRow}>
            <Clock size={16} className={isUrgent ? styles.urgentIcon : styles.timerIcon} />
            <span className={styles.timerCardTitle}>Total Game Countdown</span>
          </div>
          <span className={styles.timerNotice}>
            {remainingTime === 0 ? "Time's up! Transitioning to Vote..." : "Vote screen opens automatically at 0:00"}
          </span>
        </div>

        <div className={styles.timerMainDigit}>
          <span className={`${styles.digits} ${isUrgent ? styles.digitsUrgent : ''}`}>
            {minutes}:{(seconds).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Manual Early Vote Out CTA Button */}
      <button 
        className={styles.voteBtn}
        onClick={() => {
          sound.play('click');
          onProceedToVote();
        }}
      >
        <Vote size={18} />
        <span>Proceed to Vote Out</span>
      </button>
    </div>
  );
}
