require('dotenv').config();
const { ChatAnthropic } = require('@langchain/anthropic');

// ============================================
// STEP 1: Mock Job Data (Simulated Real Data)
// ============================================

function searchJobsDatabase(jobTitle) {
  const jobDatabase = {
    'data scientist': [
      {
        title: 'Data Scientist',
        company: 'Google',
        location: 'Mountain View, CA',
        salary: '$150k-$200k',
        description: 'Build ML models for search and recommendation systems. Required: Python, TensorFlow, Statistics',
        requirements: ['Python', 'Machine Learning', 'Statistics', 'SQL']
      },
      {
        title: 'Senior Data Scientist',
        company: 'Meta',
        location: 'Menlo Park, CA',
        salary: '$160k-$220k',
        description: 'Work on AI systems for billions of users. Required: Deep Learning, LLMs, Python',
        requirements: ['Python', 'Deep Learning', 'TensorFlow', 'Big Data']
      },
      {
        title: 'ML Data Scientist',
        company: 'Apple',
        location: 'Cupertino, CA',
        salary: '$140k-$190k',
        description: 'Build machine learning systems for iOS. Required: Swift, Python, ML',
        requirements: ['Python', 'Machine Learning', 'Statistics', 'System Design']
      }
    ],
    'ai engineer': [
      {
        title: 'AI Engineer',
        company: 'OpenAI',
        location: 'San Francisco, CA',
        salary: '$180k-$250k',
        description: 'Build large language models and AI systems. Required: Python, PyTorch, LLMs',
        requirements: ['Python', 'Deep Learning', 'LLMs', 'Transformers']
      },
      {
        title: 'Machine Learning Engineer',
        company: 'Anthropic',
        location: 'San Francisco, CA',
        salary: '$170k-$230k',
        description: 'Develop and deploy AI models. Required: Python, LLMs, System Design',
        requirements: ['Python', 'Deep Learning', 'LLMs', 'MLOps']
      }
    ],
    'ml engineer': [
      {
        title: 'ML Engineer',
        company: 'LinkedIn',
        location: 'Sunnyvale, CA',
        salary: '$160k-$210k',
        description: 'Build recommendation systems at scale. Required: Python, TensorFlow, MLOps',
        requirements: ['Python', 'TensorFlow', 'System Design', 'Cloud']
      }
    ]
  };

  const key = jobTitle.toLowerCase();
  const jobs = jobDatabase[key] || [];
  
  if (jobs.length === 0) {
    return JSON.stringify({
      error: `No jobs found for: ${jobTitle}`,
      available_roles: Object.keys(jobDatabase)
    }, null, 2);
  }

  return JSON.stringify({
    query: jobTitle,
    total_jobs: jobs.length,
    jobs: jobs.map(j => ({
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      description: j.description,
      requirements: j.requirements
    }))
  }, null, 2);
}

// ============================================
// STEP 2: Tools Definition
// ============================================

const tools = [
  {
    name: 'search_jobs',
    description: 'Search for real job postings for a specific role',
    input_schema: {
      type: 'object',
      properties: {
        job_title: {
          type: 'string',
          description: 'The job title to search for (e.g., Data Scientist, AI Engineer)'
        }
      },
      required: ['job_title']
    }
  },
  {
    name: 'analyze_skill_gap',
    description: 'Analyze the gap between current skills and target role requirements',
    input_schema: {
      type: 'object',
      properties: {
        current_skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'Your current skills (e.g., ["JavaScript", "React", "CSS"])'
        },
        target_skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'Skills required for target role'
        }
      },
      required: ['current_skills', 'target_skills']
    }
  },
  {
    name: 'estimate_timeline',
    description: 'Estimate how long it takes to learn specific skills',
    input_schema: {
      type: 'object',
      properties: {
        skills_to_learn: {
          type: 'array',
          items: { type: 'string' },
          description: 'Skills you need to learn'
        }
      },
      required: ['skills_to_learn']
    }
  }
];

// ============================================
// STEP 3: Tool Implementations
// ============================================

function analyzeSkillGap(currentSkills, targetSkills) {
  const transferable = currentSkills.filter(s => 
    targetSkills.some(t => t.toLowerCase() === s.toLowerCase())
  );
  
  const gaps = targetSkills.filter(s => 
    !currentSkills.some(c => c.toLowerCase() === s.toLowerCase())
  );

  return JSON.stringify({
    current_skills: currentSkills,
    target_skills: targetSkills,
    transferable_skills: transferable,
    skill_gaps: gaps,
    gap_count: gaps.length,
    difficulty_level: gaps.length > 4 ? 'High' : gaps.length > 2 ? 'Medium' : 'Low'
  }, null, 2);
}

function estimateTimeline(skillsToLearn) {
  const timePerSkill = {
    'python': 10,
    'machine learning': 14,
    'deep learning': 16,
    'statistics': 8,
    'sql': 4,
    'tensorflow': 10,
    'pytorch': 10,
    'llms': 8,
    'transformers': 10,
    'system design': 12,
    'mlops': 8,
    'cloud': 6
  };

  const estimates = skillsToLearn.map(skill => ({
    skill: skill,
    weeks: timePerSkill[skill.toLowerCase()] || 8
  }));

  const totalWeeks = estimates.reduce((sum, e) => sum + e.weeks, 0);
  const monthsNeeded = Math.ceil(totalWeeks / 4);

  return JSON.stringify({
    skills: estimates,
    total_weeks: totalWeeks,
    months_needed: monthsNeeded,
    realistic_timeline: monthsNeeded <= 6 ? 'Achievable' : monthsNeeded <= 12 ? 'Challenging but possible' : 'Very difficult'
  }, null, 2);
}

// ============================================
// STEP 4: Agent Loop
// ============================================

async function runAgent(userQuestion) {
  console.log('\n' + '═'.repeat(70));
  console.log('🎯 USER QUESTION:', userQuestion);
  console.log('═'.repeat(70) + '\n');

  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-opus-4-5-20251101',
    temperature: 0.7,
  });

  const modelWithTools = llm.bindTools(tools);

  let messages = [
    {
      role: 'user',
      content: userQuestion
    }
  ];

  console.log('🤖 Agent researching and analyzing...\n');

  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;
    
    const response = await modelWithTools.invoke(messages);
    messages.push({
      role: 'assistant',
      content: response.content
    });

    const toolCalls = response.tool_calls;
    
    if (!toolCalls || toolCalls.length === 0) {
      console.log('\n' + '═'.repeat(70));
      console.log('✨ FINAL ANSWER');
      console.log('═'.repeat(70) + '\n');
      console.log(response.content);
      console.log('\n' + '═'.repeat(70) + '\n');
      break;
    }

    console.log(`📌 Agent using tools:\n`);
    
    for (const toolCall of toolCalls) {
      console.log(`   📊 Tool: ${toolCall.name}`);
      console.log(`   📥 Input: ${JSON.stringify(toolCall.args)}\n`);
      
      let toolResult;
      
      if (toolCall.name === 'search_jobs') {
        toolResult = searchJobsDatabase(toolCall.args.job_title);
      } else if (toolCall.name === 'analyze_skill_gap') {
        toolResult = analyzeSkillGap(toolCall.args.current_skills, toolCall.args.target_skills);
      } else if (toolCall.name === 'estimate_timeline') {
        toolResult = estimateTimeline(toolCall.args.skills_to_learn);
      }

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
    console.log('⚠️  Max iterations reached');
  }
}

// ============================================
// STEP 5: Test Questions
// ============================================

async function main() {
  // Question 1
  await runAgent('I am a Frontend Developer with JavaScript, React, CSS skills. I want to transition to Data Scientist. What jobs are available? Do I have the right skills? How long will it take?');

  // Uncomment to test more questions:
  // await runAgent('Can I become an AI Engineer in 6 months? What do I need to learn?');
}

main().catch(console.error);
