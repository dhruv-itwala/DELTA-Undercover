# 🕶️ DELTA: Undercover

The definitive social deduction party game built with **React + Vite + CSS Modules**.

## 🎮 Game Modes

### 1. 📱 LocalPlay (Pass & Play)
- **1 Device**: Perfect for gatherings where one phone or laptop is passed in a circle.
- **3-Step Setup Wizard**: Players $\to$ Imposters & Total Game Timer $\to$ Word Packs (230+ pairs).
- **Privacy Cards**: Tap & hold secret reveal cards with instant hide-and-pass.
- **Turn-based Clues & Auto-Voteout**: Configurable total timer (1 min, 5 min, 10 min) that automatically triggers the Vote Out screen at 0:00!

### 2. 🌐 PartyPlay (Online Synchronized Room)
- **Multi-Device Sync**: Host creates a 5-letter party room code (e.g. `VIPER`). Friends join on their own phones or computers with a simple link or code.
- **Private Role Dispatch**: Each player's phone secretly displays their own word (*Civilian* vs *Imposter*).
- **Turn-Enforced Live Clue Chatroom**:
  - Live synced clue stream!
  - **Strict Turn Lock**: *Only the operative whose turn it is can write and submit a clue!* Other players see who is speaking with an animated pulse.
- **Post-Round Majority Decision**:
  - After each full clue round, the squad votes:
    - 🔄 **Another Clue Round** (need more clues)
    - 🗳️ **Proceed to Vote Out** (ready to eliminate)
  - Majority vote decides the path!
- **3-Minute All-Operative Live Debate**:
  - When proceeding to vote out, a synchronized **3:00 (180s)** countdown clock starts.
  - The chatroom opens up for **free-for-all live debate**: argue, defend, and accuse suspects!
- **Individual Secret Ballots**:
  - Each player privately casts their vote on their own screen.
  - Votes are tallied in real-time, majority suspect is eliminated, and roles are dramatically revealed!

---

## 👨💻 Developer Credits

Designed and developed by **DHRUV ITWALA**:
- **Portfolio**: [dhruv-itwala-portfolio.onrender.com](https://dhruv-itwala-portfolio.onrender.com/)
- **GitHub**: [github.com/Dhruv-Itwala](https://github.com/Dhruv-Itwala)
- **LinkedIn**: [linkedin.com/in/dhruv-itwala](https://www.linkedin.com/in/dhruv-itwala/)
- **Instagram**: [instagram.com/itwala_dhruv](https://www.instagram.com/itwala_dhruv)
- **WhatsApp**: [Connect on WhatsApp](https://api.whatsapp.com/send/?phone=9104438800&text&type=phone_number&app_absent=0)
- **YouTube**: [youtube.com/@dhruvitwala](https://youtube.com/@dhruvitwala?si=81XhgXpErB6sjjx5)

---

## 🚀 Running the Game

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Production build
npm run build
```
