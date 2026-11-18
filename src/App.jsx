import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, RotateCcw, Shield, Eye, Code2, Terminal } from 'lucide-react';
import Setup from './components/Setup/Setup';
import PassReveal from './components/PassReveal/PassReveal';
import Discussion from './components/Discussion/Discussion';
import Voting from './components/Voting/Voting';
import RevealModal from './components/RevealModal/RevealModal';
import GameOver from './components/GameOver/GameOver';
import RulesModal from './components/RulesModal/RulesModal';
import DeveloperModal from './components/DeveloperModal/DeveloperModal';
import DeltaLogo from './components/Logo/DeltaLogo';
import { getRandomWordPair } from './data/words';
import { sound } from './utils/audio';
import styles from './App.module.css';

export default function App() {
  const [stage, setStage] = useState('SETUP'); // 'SETUP' | 'PASS_REVEAL' | 'DISCUSSION' | 'VOTING' | 'GAME_OVER'
  const [players, setPlayers] = useState([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [wordPair, setWordPair] = useState({ civilian: '', imposter: '' });
  const [roundNumber, setRoundNumber] = useState(1);
  const [starterPlayer, setStarterPlayer] = useState(null);
  const [eliminatedModalData, setEliminatedModalData] = useState(null);
  const [winner, setWinner] = useState(null); // 'civilians' | 'imposters'
  const [rulesOpen, setRulesOpen] = useState(false);
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastGameConfig, setLastGameConfig] = useState(null);

  // Total Game Discussion Countdown Timer
  const [totalGameTime, setTotalGameTime] = useState(300);
  const [remainingTime, setRemainingTime] = useState(300);

  // Hidden Easter Egg Developer Credit
  const [devTapCount, setDevTapCount] = useState(0);
  const [showDevCreditToast, setShowDevCreditToast] = useState(false);

  const handleBrandClick = () => {
    const nextCount = devTapCount + 1;
    setDevTapCount(nextCount);
    if (nextCount >= 3) {
      sound.play('click');
      setDevModalOpen(true);
      setDevTapCount(0);
    }
    if (stage !== 'SETUP') {
      handleNewSetup();
    }
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleStartGame = (config) => {
    setLastGameConfig(config);
    const { playerNames, imposterCount, timerSeconds = 300, packId, customPair } = config;

    setTotalGameTime(timerSeconds);
    setRemainingTime(timerSeconds);

    // Pick words
    const pair = customPair || getRandomWordPair(packId);
    setWordPair(pair);

    // Pick imposter indices randomly
    const totalPlayers = playerNames.length;
    const indices = Array.from({ length: totalPlayers }, (_, i) => i);
    // Shuffle indices using Fisher-Yates
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const imposterIndices = new Set(indices.slice(0, imposterCount));

    // Construct player objects
    const initializedPlayers = playerNames.map((name, index) => {
      const isImposter = imposterIndices.has(index);
      return {
        id: `player-${index}-${Date.now()}`,
        name,
        isImposter,
        word: isImposter ? pair.imposter : pair.civilian,
        isEliminated: false
      };
    });

    setPlayers(initializedPlayers);
    setCurrentRevealIndex(0);
    setRoundNumber(1);
    setWinner(null);
    setEliminatedModalData(null);
    setStage('PASS_REVEAL');
  };

  // Move through secret word reveals
  const handleNextReveal = () => {
    setCurrentRevealIndex(prev => prev + 1);
  };

  // When everyone has seen their word
  const handleAllRevealed = () => {
    const randomStarter = players[Math.floor(Math.random() * players.length)];
    setStarterPlayer(randomStarter);
    setStage('DISCUSSION');
  };

  // Discussion to Voting
  const handleProceedToVote = () => {
    setStage('VOTING');
  };

  // Back from Voting to Discussion
  const handleBackToDiscussion = () => {
    setStage('DISCUSSION');
  };

  // Voting elimination
  const handleConfirmVote = (votedPlayer) => {
    const updatedPlayers = players.map(p => 
      p.id === votedPlayer.id ? { ...p, isEliminated: true } : p
    );
    setPlayers(updatedPlayers);

    // Evaluate Win condition
    const alivePlayers = updatedPlayers.filter(p => !p.isEliminated);
    const aliveImposters = alivePlayers.filter(p => p.isImposter);
    const aliveCivilians = alivePlayers.filter(p => !p.isImposter);

    let gameWinner = null;
    let gameOver = false;

    if (aliveImposters.length === 0) {
      gameWinner = 'civilians';
      gameOver = true;
    } else if (aliveCivilians.length <= aliveImposters.length) {
      gameWinner = 'imposters';
      gameOver = true;
    }

    setWinner(gameWinner);
    setEliminatedModalData({
      player: votedPlayer,
      remainingImposters: aliveImposters.length,
      remainingAliveCount: alivePlayers.length,
      isGameOver: gameOver,
      winner: gameWinner,
      alivePlayers
    });
  };

  // Proceed after elimination reveal modal
  const handleProceedAfterReveal = () => {
    if (!eliminatedModalData) return;
    const { isGameOver, alivePlayers } = eliminatedModalData;
    setEliminatedModalData(null);

    if (isGameOver) {
      setStage('GAME_OVER');
    } else {
      const nextStarter = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      setStarterPlayer(nextStarter);
      setRoundNumber(prev => prev + 1);
      setStage('DISCUSSION');
    }
  };

  // Play again with same players
  const handlePlayAgain = () => {
    if (lastGameConfig) {
      handleStartGame(lastGameConfig);
    } else {
      setStage('SETUP');
    }
  };

  // Return to setup
  const handleNewSetup = () => {
    setStage('SETUP');
    setPlayers([]);
  };

  const alivePlayers = players.filter(p => !p.isEliminated);

  return (
    <div className={styles.phoneFrame}>
      {/* Mobile Top Navigation Bar */}
      <header className={styles.topBar}>
        <div 
          onClick={handleBrandClick}
          role="button"
          tabIndex={0}
          title="DELTA: Undercover"
        >
          <DeltaLogo size="medium" showWordmark={true} />
        </div>

        <div className={styles.topActions}>
          <button 
            className={`${styles.iconBtn} ${isMuted ? styles.iconBtnMuted : ''}`}
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button 
            className={styles.iconBtn}
            onClick={() => setRulesOpen(true)}
            aria-label="How to Play"
            title="How to Play"
          >
            <HelpCircle size={17} />
          </button>

          {stage !== 'SETUP' && (
            <button 
              className={styles.iconBtn}
              onClick={handleNewSetup}
              aria-label="Restart Game"
              title="Restart Game"
            >
              <RotateCcw size={17} />
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Content */}
      <main className={styles.screenView}>
        {stage === 'SETUP' && (
          <Setup onStartGame={handleStartGame} />
        )}

        {stage === 'PASS_REVEAL' && players.length > 0 && (
          <PassReveal
            players={players}
            currentIndex={currentRevealIndex}
            onNextPlayer={handleNextReveal}
            onAllRevealed={handleAllRevealed}
          />
        )}

        {stage === 'DISCUSSION' && starterPlayer && (
          <Discussion
            roundNumber={roundNumber}
            starterPlayer={starterPlayer}
            alivePlayers={alivePlayers}
            totalGameTime={totalGameTime}
            remainingTime={remainingTime}
            onUpdateTime={setRemainingTime}
            onProceedToVote={handleProceedToVote}
          />
        )}

        {stage === 'VOTING' && (
          <Voting
            alivePlayers={alivePlayers}
            onConfirmVote={handleConfirmVote}
            onBackToDiscussion={handleBackToDiscussion}
          />
        )}

        {stage === 'GAME_OVER' && (
          <GameOver
            winner={winner}
            wordPair={wordPair}
            onPlayAgain={handlePlayAgain}
            onNewSetup={handleNewSetup}
          />
        )}
      </main>

      {/* Subtle Meta Developer Footer */}
      <footer 
        className={styles.metaFooter}
        onClick={() => setDevModalOpen(true)}
        role="button"
        tabIndex={0}
        title="Designed & Developed by DHRUV ITWALA • Tap for Credits"
      >
        <span>DELTA: Undercover</span>
        <span>•</span>
        <span>By Dhruv Itwala</span>
      </footer>

      {/* Developer Toast Easter Egg */}
      {showDevCreditToast && (
        <div className={styles.devToast}>
          <Terminal size={14} className={styles.devToastIcon} />
          <div className={styles.devToastContent}>
            <span className={styles.devToastTitle}>DELTA PROTOCOL AUTHENTICATED</span>
            <span className={styles.devToastMeta}>Designed & Developed by <strong>DHRUV ITWALA</strong></span>
          </div>
        </div>
      )}

      {/* Elimination Reveal Modal */}
      {eliminatedModalData && (
        <RevealModal
          eliminatedPlayer={eliminatedModalData.player}
          remainingImposters={eliminatedModalData.remainingImposters}
          remainingAliveCount={eliminatedModalData.remainingAliveCount}
          isGameOver={eliminatedModalData.isGameOver}
          onProceed={handleProceedAfterReveal}
        />
      )}

      {/* Rules Modal */}
      {rulesOpen && (
        <RulesModal onClose={() => setRulesOpen(false)} />
      )}

      {/* Developer Credits Modal */}
      {devModalOpen && (
        <DeveloperModal onClose={() => setDevModalOpen(false)} />
      )}
    </div>
  );
}
