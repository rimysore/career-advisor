require('dotenv').config();
const axios = require('axios');

async function debugAPI() {
  console.log('🔍 DEBUGGING RemoteOK API Response...\n');

  try {
    const response = await axios.get('https://remoteok.io/api');
    const jobs = response.data;

    console.log(`Total jobs: ${jobs.length}\n`);
    
    console.log('First job structure:');
    console.log(JSON.stringify(jobs[0], null, 2));
    
    console.log('\n\nFirst 10 job titles:');
    jobs.slice(0, 10).forEach((job, i) => {
      console.log(`${i + 1}. ${job.title} (${typeof job.title})`);
    });

    console.log('\n\nChecking for "data" field:');
    if (jobs[0].tags) {
      console.log('Tags field exists:', jobs[0].tags);
    }
    
    console.log('\n\nAll fields in first job:');
    console.log(Object.keys(jobs[0]));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugAPI();
