require('dotenv').config();
const axios = require('axios');

async function testGitHubJobs() {
  console.log('🧪 Testing GitHub Jobs Archive API\n');

  const queries = [
    'data scientist',
    'ai engineer',
    'python developer',
    'machine learning',
    'frontend',
    'backend'
  ];

  try {
    for (const query of queries) {
      console.log(`🔍 Searching: ${query}`);
      console.log('─'.repeat(50));

      try {
        const response = await axios.get('https://jobs.github.com/positions.json', {
          params: {
            description: query,
            page: 1
          }
        });

        const jobs = response.data;
        console.log(`Found: ${jobs.length} jobs\n`);

        if (jobs.length > 0) {
          jobs.slice(0, 2).forEach(job => {
            console.log(`  ✓ ${job.title}`);
            console.log(`    Company: ${job.company}`);
            console.log(`    Location: ${job.location}`);
            console.log();
          });
        }
      } catch (e) {
        console.log(`  (No results or API issue)\n`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGitHubJobs();
