import React, { useState, useEffect, useRef } from 'react';
import { Clock, Send, MessageCircle, AlertTriangle, ArrowRight, Shield, Skull, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './PartyDiscussion3Min.module.css';

const AVATAR_COLORS = [
  '#f43f5e', '#06b6d4', '#10b981', '#f59e0b',
  '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'
];

const QUICK_TAGS = [
  'I am innocent!',
  'Your clue was too vague!',
  'Look at previous clues!',
  'Vote with me!'
];

export default function PartyDiscussion3Min({
  myPlayerId,
  myPlayerName,
  alivePlayers,
  cluesHistory,
  discussionChatFeed,
  remainingSeconds,
  isHost,
  onSendChatMessage,
  onTimeExpired,
  onSkipToVoteEarly
}) {
  const [chatInput, setChatInput] = useState('');
  const [showCluesTab, setShowCluesTab] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discussionChatFeed]);

  // Tick sounds when close to zero
  useEffect(() => {
    if (remainingSeconds <= 6 && remainingSeconds > 1) {
      sound.play('tick');
    }
    if (remainingSeconds === 1) {
      sound.play('innocentLost');
    }
  }, [remainingSeconds]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sound.play('click');
    onSendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleQuickTag = (tag) => {
    sound.play('click');
    onSendChatMessage(tag);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isUrgent = remainingSeconds <= 30;

  return (
    <div className={styles.container}>
      {/* 3-Minute Synchronized Countdown Card */}
      <div className={`${styles.timerBanner} ${isUrgent ? styles.timerUrgent : ''}`}>
        <div className={styles.timerTop}>
          <Clock size={18} className={isUrgent ? styles.clockIconUrgent : styles.clockIcon} />
          <span className={styles.timerTitle}>3-MINUTE ALL-OPERATIVE DEBATE</span>
        </div>

        <div className={styles.timeDigitDisplay}>
          <span className={`${styles.timeDigits} ${isUrgent ? styles.timeDigitsUrgent : ''}`}>
            {minutes}:{(seconds).toString().padStart(2, '0')}
          </span>
          <span className={styles.timerSub}>
            {remainingSeconds === 0 ? "Time expired! Advancing to Vote..." : "Free chatroom is active. Defend & interrogate!"}
          </span>
        </div>
      </div>

      {/* Toggle View: Live Chat vs Clues History */}
      <div className={styles.tabToggle}>
        <button 
          className={`${styles.tabBtn} ${!showCluesTab ? styles.tabActive : ''}`}
          onClick={() => {
            sound.play('click');
            setShowCluesTab(false);
          }}
        >
          <MessageCircle size={14} />
          <span>Live Debate Chat</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${showCluesTab ? styles.tabActive : ''}`}
          onClick={() => {
            sound.play('click');
            setShowCluesTab(true);
          }}
        >
          <Sparkles size={14} />
          <span>Clue History ({cluesHistory.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {!showCluesTab ? (
        /* Live Synced Discussion Chatroom */
        <div className={styles.chatCard}>
          <div className={styles.feedScroll}>
            {discussionChatFeed.length === 0 ? (
              <div className={styles.emptyPrompt}>
                <MessageCircle size={28} className={styles.emptyIcon} />
                <p>The floor is open to all operatives!</p>
                <span>State your case, point out contradictions, or call out the imposter.</span>
              </div>
            ) : (
              discussionChatFeed.map((msg, idx) => {
                const isMine = msg.playerId === myPlayerId;
                return (
                  <div key={msg.id || idx} className={`${styles.msgRow} ${isMine ? styles.msgMine : ''}`}>
                    <div 
                      className={styles.avatar}
                      style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                    >
                      {msg.playerName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.msgBody}>
                      <div className={styles.msgSenderRow}>
                        <span className={styles.msgSender}>{msg.playerName}</span>
                        <span className={styles.msgTime}>{msg.time}</span>
                      </div>
                      <div className={styles.msgBubble}>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Reaction Chips */}
          <div className={styles.chipsScroll}>
            {QUICK_TAGS.map((tag, i) => (
              <button key={i} className={styles.chipBtn} onClick={() => handleQuickTag(tag)}>
                {tag}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className={styles.chatForm}>
            <input
              type="text"
              placeholder="Debate, accuse, or defend yourself..."
              value={chatInput}
              maxLength={80}
              onChange={(e) => setChatInput(e.target.value)}
              className={styles.chatInput}
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className={`${styles.sendBtn} ${!chatInput.trim() ? styles.disabledBtn : ''}`}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        /* Clues History Review Panel */
        <div className={styles.cluesReviewCard}>
          <div className={styles.cluesReviewList}>
            {cluesHistory.map((clue, idx) => (
              <div key={idx} className={styles.clueHistoryItem}>
                <span className={styles.clueAuthor}>{clue.playerName}:</span>
                <span className={styles.clueQuote}>"{clue.text}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Host Skip to Vote Early CTA */}
      {isHost && (
        <button className={styles.skipBtn} onClick={onSkipToVoteEarly}>
          <span>Table is Ready - Proceed to Vote Early</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

