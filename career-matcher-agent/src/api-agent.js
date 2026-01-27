require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const connectDB = require('./config/mongodb');
const Career = require('./models/Career');
const Skill = require('./models/Skill');
const Query = require('./models/Query');
const { searchCareersWithVectors, formatContextForClaude } = require('./services/vector-rag');
const { extractSkillsFromResponse } = require('./services/skill-extractor');

const app = express();
app.use(cors());
app.use(express.json());

console.log('Starting Career Advisor API with Vector Embeddings...\n');

connectDB();

/**
 * Call Claude API directly
 */
async function callClaude(prompt) {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-5-20251101',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );
    return response.data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error.message);
    throw error;
  }
}

async function fetchJobsFromAdzuna(jobTitle) {
  try {
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        what: jobTitle,
        results_per_page: 5,
        sort_by: 'relevance'
      },
      timeout: 8000
    });

    return (response.data.results || []).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary: job.salary_max ? `$${Math.round(job.salary_min / 1000)}K - $${Math.round(job.salary_max / 1000)}K` : 'Competitive',
      posted: job.created.substring(0, 10),
      url: job.redirect_url
    }));
  } catch (error) {
    console.log(`⚠️ Jobs error: ${error.message}`);
    return [];
  }
}

async function addNewSkill(skillName) {
  try {
    if (!skillName || skillName.length < 2 || skillName.length > 50) return false;
    const exists = await Skill.findOne({ name: { $regex: `^${skillName}$`, $options: 'i' } });
    if (!exists) {
      await Skill.create({
        name: skillName,
        difficulty: 'Medium',
        learningTime: '8-12 weeks',
        source: 'user_query'
      });
      return true;
    }
  } catch (error) {
    console.log(`⚠️ Skill error: ${skillName}`);
  }
  return false;
}

app.post('/api/career-advice', async (req, res) => {
  let searchResults = [];
  let extractedSkills = [];
  let answer = '';
  let jobs = [];

  try {
    console.log('='.repeat(70));
    const { question } = req.body;
    console.log(`Question: "${question}"\n`);

    // Search careers
    searchResults = await searchCareersWithVectors(question);
    console.log(`✅ Found ${searchResults.length} careers\n`);

    // Build context
    const context = formatContextForClaude(searchResults);
    
    // Call Claude
    console.log('📝 Calling Claude...');
    const prompt = `You are a career advisor. Answer based on this database:

${context}

User Question: "${question}"

Provide career advice with:
1. Recommended roles
2. Required skills
3. Timeline
4. Next steps`;

    answer = await callClaude(prompt);
    console.log('✅ Claude response received\n');

    // Extract skills
    extractedSkills = extractSkillsFromResponse(answer);
    if (extractedSkills.length > 0) {
      for (const skill of extractedSkills) {
        await addNewSkill(skill);
      }
    }

    // Fetch jobs
    console.log('🔍 Fetching jobs...');
    for (const career of searchResults) {
      const careerJobs = await fetchJobsFromAdzuna(career.title);
      jobs = jobs.concat(careerJobs);
    }
    console.log(`✅ Found ${jobs.length} jobs\n`);

    // Save query
    await Query.create({
      question,
      answer,
      careersUsed: searchResults.map(c => c.title),
      skillsLearned: extractedSkills
    });

    res.json({
      success: true,
      answer,
      careers: searchResults.map(c => ({ title: c.title, score: c.finalScore })),
      jobs,
      skillsLearned: extractedSkills.length
    });
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  const careerCount = await Career.countDocuments();
  const skillCount = await Skill.countDocuments();
  res.json({
    database: 'MongoDB Atlas',
    careers: careerCount,
    skills: skillCount,
    status: 'Active'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'MongoDB Atlas' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
