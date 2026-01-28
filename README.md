# Career Advisor - AI Career Guidance App

## What It Does

An AI-powered career guidance app that:
- Answers career questions using Claude AI
- Shows relevant job listings from Adzuna API
- Learns from conversations using MongoDB
- Uses semantic search (RAG) to find best career matches

## Live App

- **Frontend:** https://career-advisor-rithviks-projects-781599d8.vercel.app
- **Backend API:** https://career-advisor-2dkz.onrender.com

## How to Use

1. Go to the app
2. Ask a career question like "I want to be a DevOps engineer"
3. Get:
   - AI analysis from Claude
   - 3 best matched roles (RAG-based)
   - Real jobs from Adzuna
   - Follow-up suggestions to explore more

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS

**Backend:**
- Node.js + Express
- MongoDB Atlas (database)
- Claude API (AI)
- Adzuna API (jobs)

**Advanced Features:**
- Vector embeddings for semantic search
- RAG (Retrieval Augmented Generation)
- Real-time job fetching

## Project Structure
```
career-advisor/
├── career-matcher-web/    (Frontend - React)
│   ├── src/
│   │   ├── App.jsx       (Main component)
│   │   ├── Logo.jsx      (Header logo)
│   │   └── App.css       (Styling)
│   └── package.json
│
└── career-matcher-agent/  (Backend - Node.js)
    ├── src/
    │   ├── api-agent.js           (Main API)
    │   ├── config/
    │   │   └── mongodb.js         (DB connection)
    │   ├── models/
    │   │   ├── Career.js
    │   │   ├── Skill.js
    │   │   └── Query.js
    │   ├── services/
    │   │   ├── vector-rag.js      (Search engine)
    │   │   ├── embeddings.js      (Vector conversion)
    │   │   └── skill-extractor.js (AI text parsing)
    │   └── scripts/
    │       └── migrate-to-mongodb.js
    └── package.json
```

## API Endpoints
```
POST /api/career-advice
- Input: { question: "your career question" }
- Output: { answer, jobs[], careers[], skillsLearned }
- Real jobs from Adzuna + AI analysis + matched roles

GET /api/stats
- Returns database statistics

GET /health
- Health check
```

## How RAG Works (The Smart Part)

When you ask "I want DevOps engineer":

1. **Question converts to vector** (numbers representing meaning)
2. **Compares with all careers in database** using similarity scoring
3. **Returns top 3 matches** by relevance, not just keywords
4. **Sends to Claude** with context for personalized advice
5. **Fetches real jobs** matching the roles

This is semantic search - understands MEANING, not just words.

## Setup (If You Want to Run Locally)
```bash
# Backend
cd career-matcher-agent
npm install
NODE_ENV=development node src/api-agent.js

# Frontend (new terminal)
cd career-matcher-web
npm install
npm run dev
```

Visit: http://localhost:5173

## Key Technologies Explained

**MongoDB Atlas:** Cloud database storing careers, skills, and queries

**Claude API:** AI model that understands career questions and gives advice

**Adzuna API:** Real job listings database

**Vector Embeddings:** Convert text to numbers for similarity comparison

**RAG:** Retrieves relevant data from database before sending to AI

## Deployment

- **Frontend:** Vercel (auto-deploys from GitHub)
- **Backend:** Render (auto-deploys from GitHub)
- **Database:** MongoDB Atlas (cloud, always on)

Push to GitHub → Auto-deploys to production

## What I Learned Building This

1. Full-stack development (React, Node.js, MongoDB)
2. AI integration with Claude API
3. Vector search and semantic understanding
4. RAG pattern for better AI responses
5. API integration (Adzuna jobs)
6. Cloud deployment (Vercel, Render, MongoDB)

## Next Features to Build

- Resume upload + analysis
- Interview question generator
- Salary negotiation guide
- Personalized learning paths
- User authentication

## License

MIT
