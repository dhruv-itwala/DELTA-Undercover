import React, { useState } from 'react';
import { 
  Users, UserPlus, Trash2, Play, Sparkles, Edit3, ShieldAlert,
  Dices, Package, Utensils, MapPin, Smartphone, PawPrint, Film, Briefcase,
  AlertCircle, ArrowRight, ArrowLeft, Clock, Check
} from 'lucide-react';
import { WORD_PACKS } from '../../data/words';
import { sound } from '../../utils/audio';
import DeltaLogo from '../Logo/DeltaLogo';
import styles from './Setup.module.css';

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const AVATAR_COLORS = [
  '#f43f5e', '#06b6d4', '#10b981', '#f59e0b',
  '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'
];

const TIMER_OPTIONS = [
  { value: 60, label: '1 Min', desc: 'Fast Blitz' },
  { value: 300, label: '5 Min', desc: 'Recommended' },
  { value: 600, label: '10 Min', desc: 'Extended Debate' }
];

function renderPackIcon(iconName) {
  const iconProps = { size: 16, className: styles.packIconSvg };
  switch (iconName) {
    case 'Package': return <Package {...iconProps} />;
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'MapPin': return <MapPin {...iconProps} />;
    case 'Smartphone': return <Smartphone {...iconProps} />;
    case 'PawPrint': return <PawPrint {...iconProps} />;
    case 'Film': return <Film {...iconProps} />;
    case 'Briefcase': return <Briefcase {...iconProps} />;
    default: return <Package {...iconProps} />;
  }
}

export default function Setup({ onStartGame }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [players, setPlayers] = useState(DEFAULT_NAMES);
  const [imposterCount, setImposterCount] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [selectedPack, setSelectedPack] = useState('all');
  const [customMode, setCustomMode] = useState(false);
  const [customCivilian, setCustomCivilian] = useState('');
  const [customImposter, setCustomImposter] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (players.length >= 12) {
      setError('Maximum 12 players supported');
      return;
    }
    if (players.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      setError('Player name already exists');
      return;
    }
    sound.play('click');
    setPlayers([...players, trimmed]);
    setNewName('');
    setError('');
  };

  const handleRemovePlayer = (index) => {
    if (players.length <= 3) {
      setError('Minimum 3 players required to play');
      return;
    }
    sound.play('click');
    const updated = players.filter((_, i) => i !== index);
    setPlayers(updated);
    const maxImposters = Math.max(1, Math.floor((updated.length - 1) / 2));
    if (imposterCount > maxImposters) {
      setImposterCount(maxImposters);
    }
    setError('');
  };

  const handlePlayerRename = (index, value) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

  const goToStep = (step) => {
    if (step > currentStep) {
      if (currentStep === 1) {
        if (players.length < 3) {
          setError('Need at least 3 players');
          return;
        }
      }
    }
    setError('');
    sound.play('click');
    setCurrentStep(step);
  };

  const handleStart = () => {
    if (players.length < 3) {
      setError('Need at least 3 players');
      return;
    }
    if (customMode) {
      if (!customCivilian.trim() || !customImposter.trim()) {
        setError('Please enter both Civilian and Imposter custom words');
        return;
      }
      if (customCivilian.trim().toLowerCase() === customImposter.trim().toLowerCase()) {
        setError('Words must be different!');
        return;
      }
    }

    sound.play('start');
    onStartGame({
      playerNames: players,
      imposterCount,
      timerSeconds,
      packId: selectedPack,
      customPair: customMode ? {
        civilian: customCivilian.trim(),
        imposter: customImposter.trim()
      } : null
    });
  };

  const maxImposters = Math.max(1, Math.floor((players.length - 1) / 2));

  return (
    <div className={styles.container}>
      {/* Wizard Stepper Header */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperBar}>
          <div 
            className={styles.stepperProgress}
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>

        <div className={styles.stepsRow}>
          {[
            { num: 1, label: 'Players' },
            { num: 2, label: 'Rules & Timer' },
            { num: 3, label: 'Word Pool' }
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isActive = currentStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                className={`${styles.stepPill} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepDone : ''}`}
                onClick={() => goToStep(s.num)}
              >
                <div className={styles.stepNumWrap}>
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : s.num}
                </div>
                <span className={styles.stepTitle}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: PLAYER SELECTION */}
      {currentStep === 1 && (
        <div className={styles.stepWrapper}>
          <div className={styles.stepHero}>
            {/* <div className={styles._heroSection_192vp_9}>
              <DeltaLogo variant="square" />
            </div> */}
            <span className={styles.stepBadge}>Step 1 of 3</span>
            <h1 className={styles.stepHeading}>Player Selection</h1>
            <p className={styles.stepSub}>Add everyone who will be playing on this device.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Users size={16} className={styles.cardIcon} />
                <span>Active Operatives ({players.length})</span>
              </div>
              <span className={styles.hint}>Min 3 · Max 12</span>
            </div>

            <div className={styles.playerList}>
              {players.map((name, idx) => (
                <div key={idx} className={styles.playerRow}>
                  <div 
                    className={styles.avatar} 
                    style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <input
                    type="text"
                    className={styles.playerInput}
                    value={name}
                    maxLength={18}
                    onChange={(e) => handlePlayerRename(idx, e.target.value)}
                    placeholder={`Player ${idx + 1}`}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemovePlayer(idx)}
                    aria-label={`Remove ${name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {players.length < 12 && (
              <form onSubmit={handleAddPlayer} className={styles.addForm}>
                <input
                  type="text"
                  className={styles.addInput}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Add another player name..."
                  maxLength={18}
                />
                <button type="submit" className={styles.addBtn}>
                  <UserPlus size={15} />
                  <span>Add</span>
                </button>
              </form>
            )}
          </div>

          <button className={styles.nextStepBtn} onClick={() => goToStep(2)}>
            <span>Proceed to Rules & Timer</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 2: IMPOSTER COUNT & GAME TIMER */}
      {currentStep === 2 && (
        <div className={styles.stepWrapper}>
          <div className={styles.stepHero}>
            <span className={styles.stepBadge}>Step 2 of 3</span>
            <h1 className={styles.stepHeading}>Imposters & Total Timer</h1>
            <p className={styles.stepSub}>Configure danger level and total discussion duration.</p>
          </div>

          {/* Imposter Count Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <ShieldAlert size={16} className={styles.cardIconDanger} />
                <span>Number of Imposters</span>
              </div>
            </div>

            <div className={styles.pillGroup}>
              {[1, 2].map((num) => {
                const disabled = num > maxImposters;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={disabled}
                    className={`${styles.pillBtn} ${imposterCount === num ? styles.activePillDanger : ''} ${disabled ? styles.disabledPill : ''}`}
                    onClick={() => {
                      sound.play('click');
                      setImposterCount(num);
                    }}
                  >
                    <span className={styles.pillNumber}>{num}</span>
                    <span className={styles.pillLabel}>{num === 1 ? 'Imposter' : 'Imposters'}</span>
                    {disabled && <span className={styles.pillLock}>Requires 5+ players</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Game Timer Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Clock size={16} className={styles.cardIconCyan} />
                <span>Total Game Discussion Timer</span>
              </div>
            </div>

            <p className={styles.timerNotice}>
              When this counter reaches zero, the game automatically advances straight to the Vote Out screen!
            </p>

            <div className={styles.timerOptionsGrid}>
              {TIMER_OPTIONS.map((opt) => {
                const isSelected = timerSeconds === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.timerOptBtn} ${isSelected ? styles.timerOptSelected : ''}`}
                    onClick={() => {
                      sound.play('click');
                      setTimerSeconds(opt.value);
                    }}
                  >
                    <span className={styles.timerDuration}>{opt.label}</span>
                    <span className={styles.timerLabel}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.navRow}>
            <button className={styles.backBtn} onClick={() => goToStep(1)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button className={styles.nextStepBtn} onClick={() => goToStep(3)}>
              <span>Proceed to Word Pool</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: WORD POOL SELECTION */}
      {currentStep === 3 && (
        <div className={styles.stepWrapper}>
          <div className={styles.stepHero}>
            <span className={styles.stepBadge}>Step 3 of 3</span>
            <h1 className={styles.stepHeading}>Word Pool Selection</h1>
            <p className={styles.stepSub}>Select from 230+ curated pairs or enter your custom secret words.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Sparkles size={16} className={styles.cardIconCyan} />
                <span>Packs & Categories</span>
              </div>
              <button 
                type="button"
                className={styles.toggleModeBtn}
                onClick={() => {
                  sound.play('click');
                  setCustomMode(!customMode);
                }}
              >
                <Edit3 size={13} />
                <span>{customMode ? 'Built-in Packs' : 'Custom Words'}</span>
              </button>
            </div>

            {!customMode ? (
              <div className={styles.packGrid}>
                <button
                  type="button"
                  className={`${styles.packBtn} ${selectedPack === 'all' ? styles.activePack : ''}`}
                  onClick={() => {
                    sound.play('click');
                    setSelectedPack('all');
                  }}
                >
                  <div className={styles.packIconWrap}>
                    <Dices size={16} />
                  </div>
                  <span className={styles.packName}>All Mixed (230+)</span>
                </button>

                {WORD_PACKS.map(pack => (
                  <button
                    key={pack.id}
                    type="button"
                    className={`${styles.packBtn} ${selectedPack === pack.id ? styles.activePack : ''}`}
                    onClick={() => {
                      sound.play('click');
                      setSelectedPack(pack.id);
                    }}
                  >
                    <div className={styles.packIconWrap}>
                      {renderPackIcon(pack.iconName)}
                    </div>
                    <span className={styles.packName}>{pack.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.customWordsContainer}>
                <p className={styles.customHint}>
                  Type two relatable words (e.g., <em>Door</em> & <em>Wardrobe</em>). Keep it hidden!
                </p>
                <div className={styles.customInputs}>
                  <div className={styles.inputGroup}>
                    <label>Civilians' Word</label>
                    <input
                      type="text"
                      placeholder="e.g. Door"
                      value={customCivilian}
                      onChange={(e) => setCustomCivilian(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Imposter's Word</label>
                    <input
                      type="text"
                      placeholder="e.g. Wardrobe"
                      value={customImposter}
                      onChange={(e) => setCustomImposter(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.navRow}>
            <button className={styles.backBtn} onClick={() => goToStep(2)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button className={styles.launchBtn} onClick={handleStart}>
              <Play size={18} fill="currentColor" />
              <span>Start Mission</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
