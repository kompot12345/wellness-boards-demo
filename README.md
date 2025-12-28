# Wellness Boards (Demo)

A polished educational React demo built around an array of "boards" rendered dynamically as cards.
Styled in a clean "wellness aesthetic", mobile-friendly, and structured with reusable components.

Includes:
- Boards (array of objects) rendered dynamically with keys
- Planner (saved to SQLite)
- Profile form (saved to SQLite)
- AI assistant (OpenAI via backend proxy, key never exposed to client)
- Camera coach demo (pose detection + angle-based cues)

## Tech stack
**Client**
- React + Vite
- Tailwind CSS
- TensorFlow.js (MoveNet via @tensorflow-models/pose-detection)

**Server**
- Node.js + Express
- SQLite (better-sqlite3)
- OpenAI Node SDK

## Project structure
- `client/` React app
- `server/` API server + SQLite DB
- `README.md` documentation

## Local run

### 1) Server
```bash
cd server
cp .env.example .env
# put your OpenAI key into server/.env
npm install
npm run dev
