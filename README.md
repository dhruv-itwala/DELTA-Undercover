# 🕶️ Undercover: Imposter Word Game

A mobile-first party deduction game built with **React + Vite + CSS Modules**.

## 🎮 How to Play

1. **Setup**:
   - Add 3 to 12 players (e.g. Player A, B, C, D).
   - Choose the number of Imposters (1 or 2).
   - Pick a curated word pack (Everyday Objects, Food & Drinks, Places, Tech, Animals) or enter your own custom word pair!

2. **Secret Word Reveal (Pass & Play)**:
   - Hand the device to each player in turn.
   - Tap to reveal your secret word privately:
     - **Civilians** receive Word A (e.g., *"Door"*).
     - **The Imposter** receives a closely related Word B (e.g., *"Wardrobe"*) with a 🚨 *YOU ARE THE IMPOSTER* alert.
   - Tap to hide again and pass the device to the next player.

3. **Discussion Phase**:
   - The game randomly designates who starts speaking.
   - Going in turn order, each person gives a short clue or word describing their secret word without making it too obvious.
   - Use the optional discussion timer to keep turns snappy!

4. **Vote Out Phase**:
   - When everyone has given their clues, tap **Proceed to Vote Out**.
   - Select the player you suspect of being the Imposter and submit.
   - A dramatic elimination reveal shows whether they were an Imposter or an innocent Civilian!

5. **Win Conditions**:
   - **Civilians Win**: If all imposters are eliminated.
   - **Imposters Win**: If an innocent civilian is voted out and only 2 players remain (1 Civilian + 1 Imposter), the imposter steals the victory!

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

## 🛠️ Tech Stack
- **React 18**
- **Vite**
- **CSS Modules** (`*.module.css`)
- **Lucide Icons**
- **Canvas Confetti**
- **Audio Engine**: Royalty-free public sound effects + instantaneous Web Audio API synth fallback.

