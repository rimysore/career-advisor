require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

// CORRECT: Anthropic import
const Anthropic = require('@anthropic-ai/sdk');

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

const client = new Anthropic();

connectDB();

/**
 * Fetch jobs from Adzuna API
 */
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
      url: job.redirect_url,
      description: job.description ? job.description.substring(0, 150) + '...' : 'No description'
    }));
  } catch (error) {
    console.log(`   ⚠️  Could not fetch jobs for ${jobTitle}:`, error.message);
    return [];
  }
}

async function addNewSkill(skillName) {
  try {
    if (!skillName || skillName.length < 2 || skillName.length > 50) return false;

    const exists = await Skill.findOne({ 
      name: { $regex: `^${skillName}$`, $options: 'i' } 
    });

    if (!exists) {
      await Skill.create({
        name: skillName,
        difficulty: 'Medium',
        learningTime: '8-12 weeks',
        usedIn: [],
        source: 'user_query',
        addedDate: new Date()
      });
      console.log(`   ✓ Stored skill: ${skillName}`);
      return true;
    }
  } catch (error) {
    console.log(`   ⚠️  Could not save skill: ${skillName}`);
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
    console.log(`User Question: "${question}"\n`);

    // Vector search
    searchResults = await searchCareersWithVectors(question);
    
    if (searchResults.length === 0) {
      console.log('⚠️  No careers found in database\n');
    } else {
      console.log(`✅ Found ${searchResults.length} matching careers\n`);
    }

    const context = formatContextForClaude(searchResults);
    
    console.log('📝 Sending to Claude with vector context...');

    const message = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a career advisor. Use this career database information to answer:

${context}

User Question: "${question}"

Provide personalized career advice based on the database. Include:
1. Recommended roles
2. Required skills
3. Timeline
4. Next steps`
        }
      ]
    });

    console.log('✅ Got response from Claude\n');
    answer = message.content[0].text;

    // Extract and save skills
    console.log('📚 Extracting and saving skills...');
    extractedSkills = extractSkillsFromResponse(answer);
    
    if (extractedSkills.length > 0) {
      let skillsSaved = 0;
      for (const skill of extractedSkills) {
        const saved = await addNewSkill(skill);
        if (saved) skillsSaved++;
      }
      console.log(`   ✅ Saved ${skillsSaved} new skills\n`);
    }

    // Fetch relevant jobs
    console.log('🔍 Fetching relevant jobs from Adzuna...');
    for (const career of searchResults) {
      const careerJobs = await fetchJobsFromAdzuna(career.title);
      jobs = jobs.concat(careerJobs);
    }
    console.log(`   Found ${jobs.length} jobs\n`);

    // Save query
    await Query.create({
      question: question,
      answer: answer,
      careersUsed: searchResults.map(c => c.title),
      skillsLearned: extractedSkills,
      timestamp: new Date()
    });

    console.log('✅ Query saved to database\n');

    res.json({
      success: true,
      answer: answer,
      careers: searchResults.map(c => ({ title: c.title, score: c.finalScore })),
      jobs: jobs,
      skillsLearned: extractedSkills.length,
      jobCount: jobs.length
    });
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const careerCount = await Career.countDocuments();
    const skillCount = await Skill.countDocuments();
    const queryCount = await Query.countDocuments();
    const learnedSkills = await Skill.countDocuments({ source: 'user_query' });
    
    res.json({
      database: 'MongoDB Atlas',
      careers: careerCount,
      skills: skillCount,
      learnedSkills: learnedSkills,
      totalQueries: queryCount,
      status: 'Active with Vector Search'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'MongoDB Atlas',
    search: 'Vector Embeddings',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`🧠 Using Vector Embeddings for semantic search\n`);
});
