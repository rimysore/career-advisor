# Career Advisor - AI-Powered Career Transition Guide

An intelligent career transition platform that combines AI analysis, vector embeddings, and real job listings to guide users through career changes.

## Features

✨ **AI Career Analysis**
- Uses Claude AI to provide personalized career guidance
- RAG (Retrieval Augmented Generation) for context-aware responses
- Vector embeddings for semantic understanding

🔍 **Real Job Listings**
- Integrated with Adzuna job API
- Shows relevant opportunities based on user query
- Direct apply links

💾 **Intelligent Learning**
- MongoDB-based storage
- Learns new skills and careers from conversations
- Vector search for better matching

🎯 **Interactive Follow-ups**
- Smart follow-up suggestions
- Continue exploring related topics
- Conversational flow

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- Modern UI with professional design

**Backend:**
- Node.js + Express
- MongoDB Atlas
- Anthropic Claude API
- Adzuna Job API

**Database:**
- MongoDB Atlas (Cloud)
- Vector embeddings support

## Project Structure
```
career-advisor/
├── career-matcher-web/      (React Frontend)
│   ├── src/
│   ├── public/
│   └── package.json
└── career-matcher-agent/    (Node.js Backend)
    ├── src/
    │   ├── api-agent.js
    │   ├── models/
    │   ├── services/
    │   ├── config/
    │   └── scripts/
    └── package.json
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Anthropic API key
- Adzuna API credentials

### Backend Setup
```bash
cd career-matcher-agent
npm install
```

Create `.env`:
```
MONGODB_URI=your_mongodb_uri
ANTHROPIC_API_KEY=your_anthropic_key
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key
```

Start:
```bash
npm start
```

### Frontend Setup
```bash
cd career-matcher-web
npm install
npm run dev
```

Visit: http://localhost:5173

## API Endpoints

**POST** `/api/career-advice`
- Query: Career question
- Response: Analysis + Jobs + Follow-ups

**GET** `/api/stats`
- Returns database statistics

**GET** `/health`
- Health check endpoint

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## License

MIT

## Author

Built with ❤️ for career changers

