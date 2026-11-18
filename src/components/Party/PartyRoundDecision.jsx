import React, { useState } from 'react';
import { RotateCcw, Vote, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';
import styles from './PartyRoundDecision.module.css';

export default function PartyRoundDecision({
  roundNumber,
  myPlayerId,
  alivePlayers,
  decisionVotes, // Map<playerId, 'CONTINUE' | 'VOTE'>
  hasVoted,
  isHost,
  onCastDecisionVote,
  onForceResolveDecision
}) {
  const [selectedChoice, setSelectedChoice] = useState(null);

  const handleVote = (choice) => {
    sound.play('click');
    setSelectedChoice(choice);
    onCastDecisionVote(choice);
  };

  const totalAlive = alivePlayers.length;
  const votesArray = Object.values(decisionVotes || {});
  const continueCount = votesArray.filter(v => v === 'CONTINUE').length;
  const voteOutCount = votesArray.filter(v => v === 'VOTE').length;
  const totalVotesCast = votesArray.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Clock size={12} />
          <span>ROUND {roundNumber} CONCLUDED</span>
        </div>
        <h1 className={styles.title}>Operatives' Choice</h1>
        <p className={styles.subtitle}>
          Vote whether you need another round of clues or are ready to proceed with elimination! Majority vote decides.
        </p>
      </div>

      {/* Decision Cards */}
      <div className={styles.cardsGrid}>
        {/* Choice A: Continue */}
        <div 
          className={`${styles.decisionCard} ${selectedChoice === 'CONTINUE' ? styles.cardSelectedContinue : ''} ${hasVoted ? styles.cardLocked : ''}`}
          onClick={() => !hasVoted && handleVote('CONTINUE')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleContinue}>
              <RotateCcw size={22} />
            </div>
            {selectedChoice === 'CONTINUE' && <CheckCircle2 size={18} className={styles.checkIconContinue} />}
          </div>

          <div className={styles.cardContent}>
            <h2 className={styles.cardHeading}>Another Clue Round</h2>
            <p className={styles.cardDesc}>
              Clues are still ambiguous. Everyone gives 1 more clue in turn order.
            </p>
          </div>

          <div className={styles.voteMeter}>
            <div className={styles.meterInfo}>
              <span>Operatives in favor:</span>
              <strong>{continueCount}</strong>
            </div>
            <div className={styles.meterBar}>
              <div 
                className={styles.meterFillContinue}
                style={{ width: `${totalAlive > 0 ? (continueCount / totalAlive) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Choice B: Proceed to Vote Out */}
        <div 
          className={`${styles.decisionCard} ${selectedChoice === 'VOTE' ? styles.cardSelectedVote : ''} ${hasVoted ? styles.cardLocked : ''}`}
          onClick={() => !hasVoted && handleVote('VOTE')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleVote}>
              <Vote size={22} />
            </div>
            {selectedChoice === 'VOTE' && <CheckCircle2 size={18} className={styles.checkIconVote} />}
          </div>

          <div className={styles.cardContent}>
            <h2 className={styles.cardHeading}>Proceed to Vote Out</h2>
            <p className={styles.cardDesc}>
              Trigger a 3-minute open discussion round, then cast votes to eliminate!
            </p>
          </div>

          <div className={styles.voteMeter}>
            <div className={styles.meterInfo}>
              <span>Operatives in favor:</span>
              <strong>{voteOutCount}</strong>
            </div>
            <div className={styles.meterBar}>
              <div 
                className={styles.meterFillVote}
                style={{ width: `${totalAlive > 0 ? (voteOutCount / totalAlive) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <Users size={14} className={styles.usersIcon} />
        <span>{totalVotesCast} of {totalAlive} ballots cast</span>
        {hasVoted && <span className={styles.votedTag}>Your Vote Recorded</span>}
      </div>

      {/* Host early resolution button */}
      {isHost && (
        <button className={styles.hostResolveBtn} onClick={onForceResolveDecision}>
          <span>Resolve Decision by Majority Now</span>
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

