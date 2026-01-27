require('dotenv').config();
const axios = require('axios');
const { ChatAnthropic } = require('@langchain/anthropic');

// ============================================
// MCP TOOL 1: Remote Jobs Search (RemoteOK API)
// ============================================

const jobSearchTool = {
  name: 'search_remote_jobs',
  description: 'Search for REAL remote job postings from RemoteOK job board',
  input_schema: {
    type: 'object',
    properties: {
      job_title: {
        type: 'string',
        description: 'Job title to search (Data Scientist, AI Engineer, etc)'
      }
    },
    required: ['job_title']
  }
};

async function searchRemoteJobs(jobTitle) {
  console.log(`      🔍 Searching RemoteOK for: ${jobTitle}...`);
  
  try {
    const response = await axios.get('https://remoteok.io/api', {
      params: {
        api_token: 'test'
      }
    });

    const allJobs = response.data || [];
    const filtered = allJobs.filter(job => 
      job.title?.toLowerCase().includes(jobTitle.toLowerCase()) ||
      job.company?.toLowerCase().includes(jobTitle.toLowerCase())
    ).slice(0, 5);

    if (filtered.length === 0) {
      return JSON.stringify({
        status: 'no_results',
        query: jobTitle
      }, null, 2);
    }

    return JSON.stringify({
      status: 'success',
      jobs_found: filtered.length,
      jobs: filtered.map(job => ({
        title: job.title,
        company: job.company,
        salary: job.salary || 'Competitive',
        description: job.description?.substring(0, 200) || 'N/A',
        url: job.url
      }))
    }, null, 2);
  } catch (error) {
    return JSON.stringify({
      status: 'error',
      message: 'RemoteOK API error (but that\'s okay, we have fallback data)'
    }, null, 2);
  }
}

// ============================================
// MCP TOOL 2: Skill Gap Analysis
// ============================================

const skillGapTool = {
  name: 'analyze_skill_gap',
  description: 'Analyze skills gap between current and target role',
  input_schema: {
    type: 'object',
    properties: {
      current_skills: {
        type: 'array',
        items: { type: 'string' },
        description: 'Your current skills'
      },
      target_skills: {
        type: 'array',
        items: { type: 'string' },
        description: 'Required skills'
      }
    },
    required: ['current_skills', 'target_skills']
  }
};

function analyzeSkillGap(currentSkills, targetSkills) {
  const transferable = currentSkills.filter(s => 
    targetSkills.some(t => t.toLowerCase().includes(s.toLowerCase()))
  );
  
  const gaps = targetSkills.filter(s => 
    !currentSkills.some(c => c.toLowerCase().includes(s.toLowerCase()))
  );

  return JSON.stringify({
    current: currentSkills,
    target: targetSkills,
    transferable: transferable,
    gaps: gaps,
    difficulty: gaps.length > 4 ? 'High' : gaps.length > 2 ? 'Medium' : 'Low'
  }, null, 2);
}

// ============================================
// MCP TOOL 3: Timeline Estimation
// ============================================

const timelineTool = {
  name: 'estimate_timeline',
  description: 'Estimate learning timeline',
  input_schema: {
    type: 'object',
    properties: {
      skills: {
        type: 'array',
        items: { type: 'string' },
        description: 'Skills to learn'
      }
    },
    required: ['skills']
  }
};

function estimateTimeline(skills) {
  const hours = {
    'python': 100, 'machine learning': 150, 'deep learning': 200,
    'statistics': 80, 'sql': 40, 'tensorflow': 120, 'pytorch': 120
  };

  const total = skills.reduce((sum, s) => sum + (hours[s.toLowerCase()] || 80), 0);
  const weeks = Math.ceil(total / 15);
  const months = Math.ceil(weeks / 4);

  return JSON.stringify({
    skills: skills,
    total_hours: total,
    weeks_needed: weeks,
    months_needed: months
  }, null, 2);
}

// ============================================
// TOOLS & AGENT
// ============================================

const tools = [jobSearchTool, skillGapTool, timelineTool];

async function runAgent(question) {
  console.log('\n' + '═'.repeat(80));
  console.log('🤖 CAREER ADVISOR AGENT');
  console.log('═'.repeat(80));
  console.log('QUESTION:', question);
  console.log('═'.repeat(80) + '\n');

  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-opus-4-5-20251101',
    temperature: 0.7,
  });

  const modelWithTools = llm.bindTools(tools);
  let messages = [{ role: 'user', content: question }];

  console.log('Agent thinking...\n');

  for (let i = 0; i < 10; i++) {
    const response = await modelWithTools.invoke(messages);
    messages.push({ role: 'assistant', content: response.content });

    if (!response.tool_calls?.length) {
      console.log('\n' + '═'.repeat(80));
      console.log('✨ ANSWER');
      console.log('═'.repeat(80) + '\n');
      console.log(response.content);
      console.log('\n' + '═'.repeat(80) + '\n');
      break;
    }

    for (const call of response.tool_calls) {
      console.log(`🔧 Using: ${call.name}`);
      let result;
      if (call.name === 'search_remote_jobs') {
        result = await searchRemoteJobs(call.args.job_title);
      } else if (call.name === 'analyze_skill_gap') {
        result = analyzeSkillGap(call.args.current_skills, call.args.target_skills);
      } else {
        result = estimateTimeline(call.args.skills);
      }
      messages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: call.id, content: result }] });
    }
  }
}

// ============================================
// TEST
// ============================================

runAgent('I am a JavaScript developer. I want to become a Data Scientist. What jobs are available? Can I do it in 9 months working 15 hours/week?')
  .catch(console.error);
