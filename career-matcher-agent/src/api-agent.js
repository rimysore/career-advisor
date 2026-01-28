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

/**
 * Analyze resume with career-specific suggestions
 */
app.post('/api/analyze-resume-for-career', upload.single('resume'), async (req, res) => {
  try {
    console.log('='.repeat(70));
    console.log('📄 Resume Analysis with Career Context...\n');

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const targetCareer = req.body.targetCareer || 'Software Engineer';
    const resumeText = extractResumeText(req.file.buffer);

    // Extract skills and job titles
    const extractedSkills = extractSkills(resumeText);
    const jobTitles = extractJobTitles(resumeText);

    // Calculate ATS score
    const atsScore = calculateATSScore(resumeText);

    console.log(`✅ Extracted ${extractedSkills.length} skills`);
    console.log(`✅ ATS Score: ${atsScore}/100\n`);

    // Get career from database
    console.log(`🔍 Finding career: ${targetCareer}`);
    const career = await Career.findOne({ 
      title: { $regex: targetCareer, $options: 'i' } 
    });

    if (!career) {
      console.log(`⚠️  Career not found: ${targetCareer}`);
    }

    // Calculate match percentage
    const matchPercentage = career ? 
      calculateCareerMatch(extractedSkills, career.requiredSkills) : 0;

    // Generate Claude-powered suggestions
    console.log('📝 Generating resume suggestions from Claude...');
    const suggestions = await generateResumeSuggestions(
      resumeText,
      extractedSkills,
      targetCareer,
      career?.requiredSkills || []
    );

    console.log(`✅ Generated ${suggestions.length} suggestions\n`);

    res.json({
      success: true,
      atsScore,
      extractedSkills,
      jobTitles,
      matchPercentage: Math.round(matchPercentage),
      keywords: extractedSkills.length,
      suggestions,
      targetCareer,
      skillsGap: getSkillsGap(extractedSkills, career?.requiredSkills || [])
    });

    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate contextual resume suggestions using Claude
 */
async function generateResumeSuggestions(resumeText, skills, targetCareer, requiredSkills) {
  try {
    const prompt = `You are a professional resume coach. Analyze this resume for someone transitioning to a ${targetCareer} role.

Resume Text (first 1000 chars):
${resumeText.substring(0, 1000)}

Current Skills: ${skills.join(', ') || 'None detected'}
Target Career: ${targetCareer}
Required Skills for ${targetCareer}: ${requiredSkills.slice(0, 5).join(', ') || 'Various technical skills'}

Generate 3-4 specific, actionable resume improvements that will help them transition to ${targetCareer}. 
For each suggestion, provide:
1. title (short, 5-10 words max)
2. description (why this matters for ${targetCareer})
3. example (specific resume language they should use)
4. benefit (how it helps their career transition)
5. icon (emoji that represents the suggestion)

Format ONLY as valid JSON array like this:
[
  {
    "title": "Add Specific Technologies",
    "description": "...",
    "example": "...",
    "benefit": "...",
    "icon": "💻"
  }
]

Return ONLY the JSON array, no other text.`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-5-20251101',
        max_tokens: 1500,
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

    const responseText = response.data.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('⚠️  Could not parse Claude response, using defaults');
        return getDefaultSuggestions(targetCareer);
      }
    }

    return getDefaultSuggestions(targetCareer);
  } catch (error) {
    console.error('Error generating suggestions:', error.message);
    return getDefaultSuggestions(targetCareer);
  }
}

/**
 * Get skills gap between resume and required skills
 */
function getSkillsGap(extractedSkills, requiredSkills) {
  const missing = requiredSkills.filter(req => 
    !extractedSkills.some(ext => 
      req.toLowerCase().includes(ext.toLowerCase()) || 
      ext.toLowerCase().includes(req.toLowerCase())
    )
  );

  return missing.slice(0, 5);
}

/**
 * Calculate how well resume matches a career
 */
function calculateCareerMatch(resumeSkills, careerSkills) {
  if (!careerSkills || careerSkills.length === 0) return 0;
  
  const matches = resumeSkills.filter(skill => 
    careerSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()) || 
                            skill.toLowerCase().includes(cs.toLowerCase()))
  );
  
  return (matches.length / careerSkills.length) * 100;
}

/**
 * Default suggestions if Claude fails
 */
function getDefaultSuggestions(career) {
  const suggestions = {
    'DevOps Engineer': [
      {
        title: 'Add Infrastructure Technologies',
        description: 'DevOps roles require explicit mention of cloud platforms and tools',
        example: 'Change "worked with cloud" to "Managed 150+ EC2 instances on AWS, implemented Kubernetes orchestration"',
        benefit: 'Shows hands-on DevOps expertise that ATS systems and recruiters actively search for',
        icon: '☁️'
      },
      {
        title: 'Quantify CI/CD Improvements',
        description: 'DevOps is measured by pipeline efficiency and deployment speed',
        example: 'Add "Reduced deployment time by 65% through Jenkins pipeline optimization, decreased production incidents by 40%"',
        benefit: 'Demonstrates the core value of DevOps: speed, reliability, and automation',
        icon: '⚡'
      },
      {
        title: 'Highlight Automation Contributions',
        description: 'Automation is the DevOps mindset - replace manual work with scripts',
        example: 'Add "Automated infrastructure provisioning using Terraform, reducing manual effort by 80%"',
        benefit: 'Core DevOps skill that saves companies millions - highly valued in interviews',
        icon: '🤖'
      },
      {
        title: 'Add Monitoring & Observability',
        description: 'Modern DevOps requires proactive monitoring and alerting',
        example: 'Add "Implemented Prometheus monitoring and alert systems achieving 99.9% uptime SLA"',
        benefit: 'Shows understanding of production reliability - critical for DevOps roles',
        icon: '📊'
      }
    ],
    'Software Engineer': [
      {
        title: 'Add Language & Framework Keywords',
        description: 'Different languages and frameworks have different demand and salaries',
        example: 'Change "built web application" to "Architected React.js application with Node.js backend, PostgreSQL database"',
        benefit: 'ATS systems filter by specific technologies - explicit keywords get you more interviews',
        icon: '💻'
      },
      {
        title: 'Showcase System Design & Architecture',
        description: 'Senior software engineer roles focus on design decisions',
        example: 'Add "Designed microservices architecture reducing API response time by 50%, improving scalability"',
        benefit: 'Differentiates you from junior engineers, commands higher salary and better roles',
        icon: '🏗️'
      },
      {
        title: 'Quantify Code Quality Impact',
        description: 'Code quality directly impacts productivity and bugs',
        example: 'Add "Reduced production bugs by 35% through code reviews and testing framework implementation"',
        benefit: 'Shows you think beyond features - companies value quality and reliability',
        icon: '✅'
      }
    ],
    'Data Scientist': [
      {
        title: 'Add ML Framework & Libraries',
        description: 'Data science jobs require specific ML tools',
        example: 'Change "used machine learning" to "Built ML models using TensorFlow, scikit-learn, XGBoost achieving 92% accuracy"',
        benefit: 'ATS systems filter by specific ML tools - missing these means automatic rejection',
        icon: '🧠'
      },
      {
        title: 'Quantify Model Performance',
        description: 'Data science impact is measured by metrics',
        example: 'Add "Developed recommendation engine improving user engagement by 35%, increasing revenue by $2M"',
        benefit: 'Shows business impact - what companies actually care about',
        icon: '📈'
      },
      {
        title: 'Highlight Data Engineering Skills',
        description: 'Modern data science requires data pipeline knowledge',
        example: 'Add "Built ETL pipelines processing 50M+ records daily using Spark, Airflow"',
        benefit: 'Data engineering is increasingly expected - makes you more hireable',
        icon: '🔄'
      }
    ],
    'Cloud Engineer': [
      {
        title: 'Specify Cloud Platforms',
        description: 'Cloud engineer roles require specific platform expertise',
        example: 'Change "cloud experience" to "AWS certified: managed RDS, Lambda, S3, VPC across 3 regions"',
        benefit: 'Recruiters filter by specific clouds - AWS, Azure, GCP have different markets',
        icon: '☁️'
      },
      {
        title: 'Add Infrastructure-as-Code',
        description: 'Modern cloud requires IaC tools',
        example: 'Add "Managed infrastructure using Terraform, CloudFormation, achieving 99.99% uptime"',
        benefit: 'IaC is standard - missing it means you\'re outdated',
        icon: '🔧'
      },
      {
        title: 'Highlight Cost Optimization',
        description: 'Cloud cost management is huge responsibility',
        example: 'Add "Optimized cloud spend reducing monthly costs by $50K through reserved instances and rightsizing"',
        benefit: 'Directly impacts company bottom line - highly valued',
        icon: '💰'
      }
    ]
  };

  return suggestions[career] || suggestions['Software Engineer'];
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
