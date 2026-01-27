require('dotenv').config();
const { ChatAnthropic } = require('@langchain/anthropic');

// ============================================
// STEP 1: Define Your Tools
// ============================================

const tools = [
  {
    name: 'search_jobs',
    description: 'Search for job descriptions and required skills for a given role',
    input_schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          description: 'The job title to search for (e.g., Data Scientist)'
        }
      },
      required: ['role']
    }
  },
  {
    name: 'get_learning_time',
    description: 'Get estimated time to learn specific skills',
    input_schema: {
      type: 'object',
      properties: {
        skill: {
          type: 'string',
          description: 'The skill name (e.g., Python, Machine Learning)'
        }
      },
      required: ['skill']
    }
  }
];

// ============================================
// STEP 2: Tool Implementations
// ============================================

function executeSearchJobs(role) {
  const jobs = {
    'data scientist': {
      title: 'Data Scientist',
      required_skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow'],
      description: 'Build ML models and analyze data',
      salary: '$120k-$180k',
      experience: '2-3 years'
    },
    'ai engineer': {
      title: 'AI Engineer',
      required_skills: ['Python', 'Deep Learning', 'LLMs', 'Transformers', 'PyTorch'],
      description: 'Develop AI/ML systems',
      salary: '$150k-$220k',
      experience: '3-5 years'
    },
    'ml engineer': {
      title: 'ML Engineer',
      required_skills: ['Python', 'TensorFlow', 'System Design', 'MLOps', 'Cloud'],
      description: 'Build and deploy ML systems',
      salary: '$130k-$200k',
      experience: '2-4 years'
    }
  };

  const jobRole = role.toLowerCase();
  const job = jobs[jobRole] || jobs['data scientist'];
  return JSON.stringify(job, null, 2);
}

function executeGetLearningTime(skill) {
  const skillTimes = {
    'python': '8-12 weeks',
    'machine learning': '12-16 weeks',
    'statistics': '8-10 weeks',
    'sql': '4-6 weeks',
    'tensorflow': '10-12 weeks',
    'deep learning': '14-18 weeks',
    'llms': '6-8 weeks',
    'pytorch': '10-12 weeks'
  };

  const time = skillTimes[skill.toLowerCase()] || '8-12 weeks';
  return `${skill}: ${time}`;
}

// ============================================
// STEP 3: Agent Loop
// ============================================

async function runAgent(userQuestion) {
  console.log('\n' + '='.repeat(60));
  console.log('USER QUESTION:', userQuestion);
  console.log('='.repeat(60) + '\n');

  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-opus-4-5-20251101',
    temperature: 0.7,
  });

  // Bind tools to the model
  const modelWithTools = llm.bindTools(tools);

  // Initialize messages
  let messages = [
    {
      role: 'user',
      content: userQuestion
    }
  ];

  console.log('🤖 Agent is thinking...\n');

  // Agent loop (keep going until no more tool calls)
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;
    
    // Get response from Claude
    const response = await modelWithTools.invoke(messages);
    
    // Add assistant response to messages
    messages.push({
      role: 'assistant',
      content: response.content
    });

    // Check if there are tool calls
    const toolCalls = response.tool_calls;
    
    if (!toolCalls || toolCalls.length === 0) {
      // No more tool calls, we have the final answer
      console.log('='.repeat(60));
      console.log('FINAL ANSWER:');
      console.log('='.repeat(60));
      console.log(response.content);
      console.log('='.repeat(60) + '\n');
      break;
    }

    // Process each tool call
    console.log(`🔧 Agent wants to use tools:\n`);
    
    for (const toolCall of toolCalls) {
      console.log(`   Tool: ${toolCall.name}`);
      console.log(`   Input: ${JSON.stringify(toolCall.args)}`);
      
      let toolResult;
      
      if (toolCall.name === 'search_jobs') {
        toolResult = executeSearchJobs(toolCall.args.role);
        console.log(`   Result: Found job details\n`);
      } else if (toolCall.name === 'get_learning_time') {
        toolResult = executeGetLearningTime(toolCall.args.skill);
        console.log(`   Result: ${toolResult}\n`);
      }

      // Add tool result to messages
      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: toolResult
          }
        ]
      });
    }
  }

  if (iterations >= maxIterations) {
    console.log('❌ Agent reached max iterations');
  }
}

// ============================================
// STEP 4: Test
// ============================================

async function main() {
  await runAgent('I want to transition to Data Science. I have 6 months. Is it realistic?');
}

main().catch(console.error);
