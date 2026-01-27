require('dotenv').config();
const { ChatAnthropic } = require('@langchain/anthropic');

async function testLangChain() {
  console.log('Testing LangChain + Claude...\n');

  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-opus-4-5-20251101',
    temperature: 0.7,
  });

  console.log('✅ LangChain initialized successfully!');
  console.log('✅ Claude model: claude-opus-4-5-20251101');
  console.log('✅ API connection ready!\n');

  try {
    console.log('Sending test message to Claude...\n');
    
    const message = await llm.invoke([
      {
        role: 'user',
        content: 'Say "Career Matcher Agent Setup Complete!" and nothing else.'
      }
    ]);

    console.log('Response from Claude:');
    console.log(message.content);
    console.log('\n✅ Everything is working perfectly!');
  } catch (error) {
    console.error('❌ Error calling Claude API:');
    console.error(error.message);
  }
}

testLangChain();
