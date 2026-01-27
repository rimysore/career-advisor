require('dotenv').config();

console.log('✅ Environment loaded!');
console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY?.slice(0, 10));
console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY not found in .env file');
  process.exit(1);
}

console.log('✅ API Key is set correctly!');
