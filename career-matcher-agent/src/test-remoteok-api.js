require('dotenv').config();
const axios = require('axios');

async function testRemoteOKAPI() {
  console.log('🧪 Testing RemoteOK API (REAL DATA)...\n');

  try {
    console.log('📡 Fetching all remote jobs from RemoteOK...\n');
    const response = await axios.get('https://remoteok.io/api', {
      timeout: 10000
    });

    const allJobs = response.data;
    console.log(`✅ API Works! Got ${allJobs.length} total remote jobs\n`);

    // Search for Data Scientist jobs
    console.log('🔍 SEARCHING FOR: Data Scientist\n');
    const dataScientists = allJobs.filter(job => 
      job.title?.toLowerCase().includes('data scientist') ||
      job.title?.toLowerCase().includes('data science')
    );

    console.log(`Found ${dataScientists.length} Data Scientist jobs:\n`);
    dataScientists.slice(0, 3).forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Salary: ${job.salary || 'Not specified'}`);
      console.log(`   Posted: ${job.date}`);
      console.log(`   URL: ${job.url}`);
      console.log();
    });

    // Search for AI Engineer
    console.log('\n🔍 SEARCHING FOR: AI Engineer\n');
    const aiEngineers = allJobs.filter(job => 
      job.title?.toLowerCase().includes('ai engineer') ||
      job.title?.toLowerCase().includes('ai engineering')
    );

    console.log(`Found ${aiEngineers.length} AI Engineer jobs:\n`);
    aiEngineers.slice(0, 3).forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Salary: ${job.salary || 'Not specified'}`);
      console.log(`   Posted: ${job.date}`);
      console.log();
    });

    // Search for Python Developer
    console.log('\n🔍 SEARCHING FOR: Python Developer\n');
    const pythonDevs = allJobs.filter(job => 
      job.title?.toLowerCase().includes('python')
    );

    console.log(`Found ${pythonDevs.length} Python jobs:\n`);
    pythonDevs.slice(0, 3).forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Salary: ${job.salary || 'Not specified'}`);
      console.log();
    });

    // Search for Machine Learning
    console.log('\n🔍 SEARCHING FOR: Machine Learning\n');
    const mlJobs = allJobs.filter(job => 
      job.title?.toLowerCase().includes('machine learning') ||
      job.title?.toLowerCase().includes('ml')
    );

    console.log(`Found ${mlJobs.length} ML jobs:\n`);
    mlJobs.slice(0, 3).forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Salary: ${job.salary || 'Not specified'}`);
      console.log();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRemoteOKAPI();
