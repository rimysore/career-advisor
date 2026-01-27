require('dotenv').config();
const mongoose = require('mongoose');
const Career = require('../models/Career');

async function addDevOpsRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const newRoles = [
      {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        description: 'Manages infrastructure, deployment, and cloud systems',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Linux', 'CI/CD', 'Terraform', 'Jenkins'],
        timeline: '6-9 months for backend developers',
        salaryRange: '$110K-$190K',
        learningResources: ['Kubernetes official docs', 'AWS certification path', 'Docker tutorials'],
        commonTransitions: ['Backend Developer', 'System Administrator', 'Cloud Engineer'],
        jobGrowth: 'High - 18% growth expected',
        source: 'built-in'
      },
      {
        id: 'cloud-engineer',
        title: 'Cloud Engineer',
        description: 'Designs and manages cloud infrastructure and solutions',
        requiredSkills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Cloud Architecture', 'Networking', 'Security'],
        timeline: '8-12 months for backend developers',
        salaryRange: '$120K-$200K',
        learningResources: ['Cloud certifications', 'Architecture design courses'],
        commonTransitions: ['Backend Developer', 'DevOps Engineer'],
        jobGrowth: 'Very High - 25% growth expected',
        source: 'built-in'
      },
      {
        id: 'site-reliability-engineer',
        title: 'Site Reliability Engineer (SRE)',
        description: 'Ensures system reliability, performance, and uptime',
        requiredSkills: ['Linux', 'Python', 'Monitoring', 'Incident Management', 'System Design', 'Cloud Platforms'],
        timeline: '12-18 months for backend developers',
        salaryRange: '$130K-$210K',
        learningResources: ['Google SRE books', 'Monitoring tools training'],
        commonTransitions: ['Backend Developer', 'DevOps Engineer'],
        jobGrowth: 'High - 20% growth expected',
        source: 'built-in'
      }
    ];

    console.log('📚 Adding DevOps-related roles...\n');
    for (const role of newRoles) {
      const exists = await Career.findOne({ id: role.id });
      if (!exists) {
        await Career.create(role);
        console.log(`  ✓ Created: ${role.title}`);
      } else {
        console.log(`  - Skipped (exists): ${role.title}`);
      }
    }

    const count = await Career.countDocuments();
    console.log(`\n✅ Total careers in database: ${count}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDevOpsRoles();
