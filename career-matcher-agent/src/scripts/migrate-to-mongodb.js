require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Career = require('../models/Career');
const Skill = require('../models/Skill');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const jsonData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../database/careers.json'), 'utf8')
    );

    console.log('📚 Migrating careers...');
    for (const career of jsonData.careers) {
      const exists = await Career.findOne({ id: career.id });
      if (!exists) {
        await Career.create(career);
        console.log(`  ✓ Created: ${career.title}`);
      } else {
        console.log(`  - Skipped (exists): ${career.title}`);
      }
    }

    console.log('\n📚 Migrating skills...');
    if (jsonData.skills) {
      for (const skill of jsonData.skills) {
        const exists = await Skill.findOne({ name: skill.name });
        if (!exists) {
          await Skill.create(skill);
          console.log(`  ✓ Created: ${skill.name}`);
        } else {
          console.log(`  - Skipped (exists): ${skill.name}`);
        }
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
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
