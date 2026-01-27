require('dotenv').config();
const axios = require('axios');
const { ChatAnthropic } = require('@langchain/anthropic');

// ============================================
// MCP TOOL 1: Adzuna Real Job Search
// ============================================

const jobSearchTool = {
  name: 'search_adzuna_jobs',
  description: 'Search for REAL job postings from Adzuna job board - covers 500K+ actual jobs',
  input_schema: {
    type: 'object',
    properties: {
      job_title: {
        type: 'string',
        description: 'Job title (Data Scientist, AI Engineer, Python Developer, etc)'
      },
      location: {
        type: 'string',
        description: 'Location (United States, London, etc). Default: United States'
      }
    },
    required: ['job_title']
  }
};

async function searchAdzunaJobs(jobTitle, location = 'United States') {
  console.log(`      🔍 Searching Adzuna for: ${jobTitle} in ${location}...`);
  
  try {
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        what: jobTitle,
        where: location.toLowerCase().replace(/\s+/g, '_'),
        results_per_page: 5
      }
    });

    const jobs = response.data.results || [];
    
    if (jobs.length === 0) {
      return JSON.stringify({
        status: 'no_results',
        message: `No jobs found for "${jobTitle}" in ${location}`,
        total_available: response.data.count
      }, null, 2);
    }

    return JSON.stringify({
      status: 'success',
      total_jobs_available: response.data.count,
      showing: jobs.length,
      jobs: jobs.map(job => ({
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_currency: job.salary_currency_code,
        description: job.description.substring(0, 300) + '...',
        posted_date: job.created.substring(0, 10),
        job_url: job.redirect_url
      }))
    }, null, 2);
  } catch (error) {
    return JSON.stringify({
      status: 'error',
      error: error.message,
      hint: 'Check your ADZUNA_APP_ID and ADZUNA_API_KEY in .env'
    }, null, 2);
  }
}

// ============================================
// MCP TOOL 2: Skill Gap Analysis
// ============================================

const skillGapTool = {
  name: 'analyze_skill_gap',
  description: 'Analyze skills gap between your current skills and target role requirements',
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
        description: 'Skills required for target role'
      }
    },
    required: ['current_skills', 'target_skills']
  }
};

function analyzeSkillGap(currentSkills, targetSkills) {
  const transferable = currentSkills.filter(s => 
    targetSkills.some(t => t.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(t.toLowerCase()))
  );
  
  const gaps = targetSkills.filter(s => 
    !currentSkills.some(c => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase()))
  );

  let difficulty;
  if (gaps.length <= 2) difficulty = 'Easy - Transition';
  else if (gaps.length <= 4) difficulty = 'Moderate - Achievable';
  else if (gaps.length <= 6) difficulty = 'Challenging - Doable';
  else difficulty = 'Very Challenging - Long-term';

  return JSON.stringify({
    current_skills: currentSkills,
    target_skills: targetSkills,
    transferable_skills: transferable,
    skill_gaps: gaps,
    gap_count: gaps.length,
    difficulty_level: difficulty,
    summary: `You have ${transferable.length} transferable skills and need to learn ${gaps.length} new skills.`
  }, null, 2);
}

// ============================================
// MCP TOOL 3: Timeline Estimation
// ============================================

const timelineTool = {
  name: 'estimate_learning_timeline',
  description: 'Estimate realistic timeline to learn specific skills',
  input_schema: {
    type: 'object',
    properties: {
      skills: {
        type: 'array',
        items: { type: 'string' },
        description: 'Skills you need to learn'
      },
      hours_per_week: {
        type: 'number',
        description: 'Hours per week you can dedicate. Default: 10'
      }
    },
    required: ['skills']
  }
};

function estimateTimeline(skills, hoursPerWeek = 10) {
  const skillHours = {
    'python': 100,
    'machine learning': 150,
    'deep learning': 200,
    'statistics': 80,
    'sql': 40,
    'tensorflow': 120,
    'pytorch': 120,
    'llms': 100,
    'transformers': 100,
    'system design': 150,
    'mlops': 100,
    'cloud': 80,
    'docker': 60,
    'kubernetes': 120,
    'data visualization': 60,
    'pandas': 80,
    'numpy': 80,
    'scikit-learn': 90,
    'spacy': 80,
    'flask': 60,
    'django': 100
  };

  const estimates = skills.map(skill => {
    const hours = skillHours[skill.toLowerCase()] || 100;
    const weeks = Math.ceil(hours / hoursPerWeek);
    return { skill, hours_needed: hours, weeks_needed: weeks };
  });

  const totalHours = estimates.reduce((sum, e) => sum + e.hours_needed, 0);
  const totalWeeks = Math.ceil(totalHours / hoursPerWeek);
  const months = Math.ceil(totalWeeks / 4);

  let realistic;
  if (months <= 3) realistic = '✅ Very Achievable';
  else if (months <= 6) realistic = '✅ Achievable';
  else if (months <= 12) realistic = '⚠️ Challenging but Doable';
  else realistic = '⏱️ Long-term Commitment';

  return JSON.stringify({
    hours_per_week: hoursPerWeek,
    skills_breakdown: estimates,
    total_hours: totalHours,
    total_weeks: totalWeeks,
    total_months: months,
    realistic_timeline: realistic
  }, null, 2);
}

// ============================================
// ALL TOOLS
// ============================================

const tools = [jobSearchTool, skillGapTool, timelineTool];

// ============================================
// AGENT EXECUTION
// ============================================

async function runCareerAdvisor(userQuestion) {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 CAREER ADVISOR AGENT (With Real Adzuna Data)');
  console.log('═'.repeat(80));
  console.log('QUESTION:', userQuestion);
  console.log('═'.repeat(80) + '\n');

  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-opus-4-5-20251101',
    temperature: 0.7,
  });

  const modelWithTools = llm.bindTools(tools);

  let messages = [{ role: 'user', content: userQuestion }];

  console.log('🤖 Agent analyzing real job market data...\n');

  for (let iteration = 0; iteration < 10; iteration++) {
    const response = await modelWithTools.invoke(messages);
    messages.push({ role: 'assistant', content: response.content });

    const toolCalls = response.tool_calls;
    
    if (!toolCalls || toolCalls.length === 0) {
      console.log('\n' + '═'.repeat(80));
      console.log('✨ FINAL RECOMMENDATION (Based on Real Job Market Data)');
      console.log('═'.repeat(80) + '\n');
      console.log(response.content);
      console.log('\n' + '═'.repeat(80) + '\n');
      break;
    }

    console.log(`📌 Step ${iteration + 1}:\n`);
    
    for (const toolCall of toolCalls) {
      console.log(`   🔧 Using Tool: ${toolCall.name}`);
      console.log(`   📥 Input: ${JSON.stringify(toolCall.args)}\n`);
      
      let toolResult;
      
      if (toolCall.name === 'search_adzuna_jobs') {
        toolResult = await searchAdzunaJobs(
          toolCall.args.job_title,
          toolCall.args.location || 'United States'
        );
      } else if (toolCall.name === 'analyze_skill_gap') {
        toolResult = analyzeSkillGap(
          toolCall.args.current_skills,
          toolCall.args.target_skills
        );
      } else if (toolCall.name === 'estimate_learning_timeline') {
        toolResult = estimateTimeline(
          toolCall.args.skills,
          toolCall.args.hours_per_week || 10
        );
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
}

// ============================================
// TEST
// ============================================

async function main() {
  await runCareerAdvisor(
    'I am a JavaScript/React developer with 4 years experience. I want to transition to Data Science. What real jobs are available? How difficult is this transition? Can I do it in 8 months studying 15 hours per week?'
  );
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
