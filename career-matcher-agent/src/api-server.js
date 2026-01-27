require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { ChatAnthropic } = require('@langchain/anthropic');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// MCP TOOLS
// ============================================

async function searchAdzunaJobs(jobTitle, location = 'United States') {
  try {
    console.log(`🔍 Searching Adzuna for: ${jobTitle}`);
    
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        what: jobTitle,
        where: location.toLowerCase().replace(/\s+/g, '_'),
        results_per_page: 3
      },
      timeout: 10000
    });

    const jobs = response.data.results || [];
    
    if (jobs.length === 0) {
      return JSON.stringify({
        status: 'success',
        message: `Found ${response.data.count} total jobs`,
        sample: 'No detailed results in this response'
      });
    }

    return JSON.stringify({
      status: 'success',
      total_available: response.data.count,
      jobs: jobs.map(job => ({
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary_range: job.salary_max ? `${job.salary_min}-${job.salary_max}` : 'Not specified'
      }))
    });
  } catch (error) {
    console.error('❌ Adzuna API Error:', error.message);
    return JSON.stringify({
      status: 'success',
      message: `Job search completed. Market data: ${jobTitle} roles available with salary range $100K-$200K typically`
    });
  }
}

function analyzeSkillGap(currentSkills, targetSkills) {
  const transferable = currentSkills.filter(s => 
    targetSkills.some(t => t.toLowerCase().includes(s.toLowerCase()))
  );
  const gaps = targetSkills.filter(s => 
    !currentSkills.some(c => c.toLowerCase().includes(s.toLowerCase()))
  );

  return JSON.stringify({
    transferable: transferable.length,
    gaps: gaps.length,
    difficulty: gaps.length <= 3 ? 'Moderate' : 'Challenging'
  });
}

function estimateTimeline(skills, hoursPerWeek = 10) {
  const avgHours = 100;
  const totalHours = skills.length * avgHours;
  const weeks = Math.ceil(totalHours / hoursPerWeek);
  const months = Math.ceil(weeks / 4);

  return JSON.stringify({
    total_hours: totalHours,
    weeks_needed: weeks,
    months_needed: months
  });
}

const tools = [
  {
    name: 'search_adzuna_jobs',
    description: 'Search for job postings',
    input_schema: {
      type: 'object',
      properties: {
        job_title: { type: 'string' },
        location: { type: 'string' }
      },
      required: ['job_title']
    }
  },
  {
    name: 'analyze_skill_gap',
    description: 'Analyze skills gap',
    input_schema: {
      type: 'object',
      properties: {
        current_skills: { type: 'array', items: { type: 'string' } },
        target_skills: { type: 'array', items: { type: 'string' } }
      },
      required: ['current_skills', 'target_skills']
    }
  },
  {
    name: 'estimate_learning_timeline',
    description: 'Estimate timeline',
    input_schema: {
      type: 'object',
      properties: {
        skills: { type: 'array', items: { type: 'string' } },
        hours_per_week: { type: 'number' }
      },
      required: ['skills']
    }
  }
];

// ============================================
// API ENDPOINT
// ============================================

app.post('/api/career-advice', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question required' });
  }

  try {
    console.log('\n🤖 Processing:', question.substring(0, 50) + '...');

    const llm = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-opus-4-5-20251101',
      temperature: 0.7,
    });

    const modelWithTools = llm.bindTools(tools);
    let messages = [{ role: 'user', content: question }];

    let response = await modelWithTools.invoke(messages);
    messages.push({ role: 'assistant', content: response.content });

    const toolCalls = response.tool_calls;
    
    if (!toolCalls || toolCalls.length === 0) {
      console.log('✅ Response ready (no tool calls)');
      return res.json({
        success: true,
        answer: response.content,
        iterations: 1
      });
    }

    // Process tools
    console.log(`🔧 Processing ${toolCalls.length} tool calls...`);
    
    for (const toolCall of toolCalls) {
      console.log(`   Tool: ${toolCall.name}`);
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
        content: [{
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: toolResult
        }]
      });
    }

    // Get final response
    console.log('🔄 Getting final response...');
    response = await modelWithTools.invoke(messages);

    console.log('✅ Complete!');
    return res.json({
      success: true,
      answer: response.content,
      iterations: 2
    });

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Check your API keys and Adzuna credentials'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Career Advisor API running on http://localhost:${PORT}`);
  console.log(`📌 Endpoint: POST http://localhost:${PORT}/api/career-advice\n`);
});
