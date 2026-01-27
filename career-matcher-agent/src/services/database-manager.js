const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/careers.json');

function loadDatabase() {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

function saveDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ Database updated and saved');
}

/**
 * Add new career to database if it doesn't exist
 */
function addNewCareer(careerData) {
  const db = loadDatabase();
  
  // Check if career already exists
  const exists = db.careers.some(c => c.id === careerData.id);
  if (exists) {
    console.log(`Career "${careerData.id}" already exists`);
    return;
  }

  // Add new career
  db.careers.push({
    id: careerData.id,
    title: careerData.title,
    description: careerData.description || 'Career role',
    requiredSkills: careerData.skills || [],
    timeline: careerData.timeline || 'Variable',
    salaryRange: careerData.salary || 'Competitive',
    learningResources: careerData.resources || [],
    commonTransitions: careerData.transitions || [],
    jobGrowth: careerData.growth || 'Growing',
    addedBy: 'AI Learning',
    addedDate: new Date().toISOString(),
    source: 'user_query'
  });

  saveDatabase(db);
  console.log(`📚 New career added: ${careerData.title}`);
}

/**
 * Extract new skills from Claude's response
 */
function extractAndSaveNewSkills(answer, question) {
  const skillPatterns = [
    /need[s]? to learn[:\s]+([^.]+)/gi,
    /required skill[s]?[:\s]+([^.]+)/gi,
    /learn[s]? ([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/g
  ];

  const skills = new Set();
  
  skillPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(answer)) !== null) {
      skills.add(match[1].trim());
    }
  });

  if (skills.size > 0) {
    console.log(`\n📚 Found ${skills.size} new skills from response:`);
    const db = loadDatabase();
    
    skills.forEach(skill => {
      const skillExists = db.skills?.some(s => s.name.toLowerCase() === skill.toLowerCase());
      if (!skillExists) {
        if (!db.skills) db.skills = [];
        db.skills.push({
          name: skill,
          difficulty: 'Medium',
          learningTime: '8-12 weeks',
          usedIn: [],
          addedDate: new Date().toISOString(),
          source: 'user_query'
        });
        console.log(`   ✓ Stored: ${skill}`);
      }
    });
    
    saveDatabase(db);
  }
}

/**
 * Get all learned/dynamic careers
 */
function getLearnedCareers() {
  const db = loadDatabase();
  return db.careers.filter(c => c.source === 'user_query');
}

module.exports = {
  loadDatabase,
  saveDatabase,
  addNewCareer,
  extractAndSaveNewSkills,
  getLearnedCareers
};
