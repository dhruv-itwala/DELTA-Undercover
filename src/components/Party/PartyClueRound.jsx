import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, MessageSquare, Clock, User, Radio, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './PartyClueRound.module.css';

const AVATAR_COLORS = [
  '#f43f5e', '#06b6d4', '#10b981', '#f59e0b',
  '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'
];

export default function PartyClueRound({
  roundNumber,
  myPlayerId,
  currentTurnPlayerId,
  alivePlayers,
  cluesFeed,
  myWord,
  typingUsers = {},
  onTyping,
  onSubmitClue
}) {
  const [clueText, setClueText] = useState('');
  const chatEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const currentTurnPlayer = alivePlayers.find(p => p.id === currentTurnPlayerId);
  const isMyTurn = myPlayerId === currentTurnPlayerId;
  const isCurrentTurnPlayerTyping = Boolean(currentTurnPlayerId && typingUsers[currentTurnPlayerId]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cluesFeed]);

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (onTyping) onTyping(false);
    };
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setClueText(val);

    if (onTyping && isMyTurn) {
      if (val.trim().length > 0) {
        onTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          onTyping(false);
        }, 2500);
      } else {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        onTyping(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isMyTurn || !clueText.trim()) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (onTyping) onTyping(false);

    sound.play('click');
    onSubmitClue(clueText.trim());
    setClueText('');
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.roundHeader}>
        <div className={styles.roundPill}>
          <span className={styles.liveDot} />
          <span>ROUND {roundNumber} CLUES</span>
        </div>
        <div className={styles.secretWordPill}>
          <span className={styles.secretLabel}>Your Word:</span>
          <span className={styles.secretValue}>{myWord}</span>
        </div>
      </div>

      {/* Turn Spotlight Banner */}
      <div className={`${styles.spotlightCard} ${isMyTurn ? styles.spotlightMyTurn : ''}`}>
        <div className={styles.spotlightIcon}>
          <Radio size={20} className={isMyTurn ? styles.radarPulse : ''} />
        </div>
        <div className={styles.spotlightMeta}>
          <span className={styles.spotlightLabel}>
            {isMyTurn ? '🚨 YOUR TURN TO SPEAK!' : 'CURRENT OPERATIVE SPEAKING'}
          </span>
          <h2 className={styles.spotlightName}>
            {isMyTurn ? 'Submit Your Clue Below' : `${currentTurnPlayer?.name || 'Operative'}'s Turn`}
          </h2>
        </div>
      </div>

      {/* Live Clue Chatroom Feed */}
      <div className={styles.chatCard}>
        <div className={styles.chatHeader}>
          <MessageSquare size={14} className={styles.chatIcon} />
          <span>Live Clue Transmissions ({cluesFeed.length})</span>
        </div>

        <div className={styles.feedScroll}>
          {cluesFeed.length === 0 ? (
            <div className={styles.emptyFeed}>
              <Sparkles size={24} className={styles.emptyIcon} />
              <p>No clues submitted yet for this round.</p>
              <span>{currentTurnPlayer?.name} will open the round!</span>
            </div>
          ) : (
            cluesFeed.map((clue, idx) => {
              const isMine = clue.playerId === myPlayerId;
              return (
                <div key={clue.id || idx} className={`${styles.messageRow} ${isMine ? styles.messageMine : ''}`}>
                  <div 
                    className={styles.avatar} 
                    style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                  >
                    {clue.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.bubbleWrap}>
                    <div className={styles.senderRow}>
                      <span className={styles.senderName}>{clue.playerName}</span>
                      <span className={styles.msgTime}>{clue.time}</span>
                    </div>
                    <div className={styles.clueBubble}>
                      <p className={styles.clueText}>"{clue.text}"</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Turn-Locked Clue Input */}
        <div className={styles.inputArea}>
          {isMyTurn ? (
            <form onSubmit={handleSubmit} className={styles.activeForm}>
              <input
                type="text"
                className={styles.clueInput}
                placeholder="Type your one-sentence clue..."
                value={clueText}
                maxLength={60}
                onChange={handleInputChange}
                onBlur={() => onTyping && onTyping(false)}
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!clueText.trim()}
                className={`${styles.sendBtn} ${!clueText.trim() ? styles.disabledBtn : ''}`}
              >
                <span>Send</span>
                <Send size={15} />
              </button>
            </form>
          ) : (
            <div className={`${styles.lockedBar} ${isCurrentTurnPlayerTyping ? styles.lockedBarTyping : ''}`}>
              <Lock size={15} className={styles.lockIcon} />
              <span className={styles.lockedText}>
                {isCurrentTurnPlayerTyping ? (
                  <><strong>{currentTurnPlayer?.name}</strong> is drafting clue...</>
                ) : (
                  <>Waiting for <strong>{currentTurnPlayer?.name}</strong> to give their clue...</>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

