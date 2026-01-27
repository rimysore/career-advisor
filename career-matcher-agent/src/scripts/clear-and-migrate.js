require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Career = require('../models/Career');
const Skill = require('../models/Skill');

async function clearAndMigrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing old data...');
    await Career.deleteMany({});
    await Skill.deleteMany({});
    console.log('  ✓ Cleared careers');
    console.log('  ✓ Cleared skills\n');

    // Load and migrate
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../database/careers.json'), 'utf8')
    );

    console.log('📚 Inserting careers...');
    for (const career of jsonData.careers) {
      const created = await Career.create({
        id: career.id,
        title: career.title,
        description: career.description,
        requiredSkills: career.requiredSkills,
        timeline: career.timeline,
        salaryRange: career.salaryRange,
        learningResources: career.learningResources,
        commonTransitions: career.commonTransitions,
        jobGrowth: career.jobGrowth,
        source: 'built-in',
        addedDate: new Date()
      });
      console.log(`  ✓ Created: ${created.title}`);
    }

    console.log('\n📚 Inserting skills...');
    if (jsonData.skills) {
      for (const skill of jsonData.skills) {
        const created = await Skill.create({
          name: skill.name,
          difficulty: skill.difficulty,
          learningTime: skill.learningTime,
          usedIn: skill.usedIn,
          source: 'built-in'
        });
        console.log(`  ✓ Created: ${created.name}`);
      }
    }

    const careerCount = await Career.countDocuments();
    const skillCount = await Skill.countDocuments();
    
    console.log('\n✅ Migration complete!');
    console.log(`\nDatabase Stats:`);
    console.log(`  Careers: ${careerCount}`);
    console.log(`  Skills: ${skillCount}\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAndMigrate();
