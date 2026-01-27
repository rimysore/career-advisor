require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 Starting API...');
console.log('✅ Express loaded');
console.log('✅ CORS enabled');

// Test if Claude API key exists
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in .env');
  process.exit(1);
}
console.log('✅ Claude API key found');

// Test endpoint - no Claude, just echo
app.post('/api/career-advice', (req, res) => {
  console.log('📌 Request received');
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question required' });
  }

  console.log('✅ Question:', question.substring(0, 50));
  
  // Just return a mock response without using Claude yet
  res.json({
    success: true,
    answer: `You asked: ${question}\n\nMock response: This is a test.`,
    iterations: 1
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Debug API running on http://localhost:${PORT}\n`);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Rejection:', error);
});
