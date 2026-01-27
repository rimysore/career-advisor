require('dotenv').config();
const express = require('express');
const cors = require('cors');

console.log('🚀 Creating Express app...');
const app = express();

console.log('🚀 Setting up middleware...');
app.use(cors());
app.use(express.json());

console.log('🚀 Setting up routes...');

app.post('/api/career-advice', (req, res) => {
  console.log('\n📌 ========== REQUEST RECEIVED ==========');
  console.log('Question:', req.body.question);
  
  const answer = `
## Your Career Analysis

You asked: "${req.body.question || 'No question'}"

### Summary
- Market is strong for your role
- Opportunities are available
- Timeline is achievable with effort

**Next Steps**: 
1. Identify your target role
2. Learn required skills
3. Build portfolio projects
4. Start applying
`;

  console.log('✅ Sending response...\n');
  res.json({ success: true, answer: answer.trim() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

console.log('🚀 Starting server...');

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`\n✅ API is RUNNING on http://localhost:${PORT}\n`);
}, (err) => {
  if (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception:', err);
  process.exit(1);
});
