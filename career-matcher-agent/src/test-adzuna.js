require('dotenv').config();
const axios = require('axios');

async function testAdzunaAPI() {
  console.log('🧪 Testing Adzuna API with your keys...\n');

  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  console.log(`App ID: ${appId}`);
  console.log(`API Key: ${apiKey?.substring(0, 10)}...\n`);

  const queries = [
    { title: 'Data Scientist', where: 'United States' },
    { title: 'AI Engineer', where: 'United States' },
    { title: 'Python Developer', where: 'United States' },
    { title: 'Machine Learning Engineer', where: 'United States' },
  ];

  try {
    for (const query of queries) {
      console.log(`🔍 Searching: ${query.title}`);
      console.log('─'.repeat(60));

      const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
        params: {
          app_id: appId,
          app_key: apiKey,
          what: query.title,
          where: query.where,
          results_per_page: 3
        }
      });

      const jobs = response.data.results || [];
      console.log(`✅ Found ${response.data.count} total jobs\n`);

      jobs.forEach((job, i) => {
        console.log(`${i + 1}. ${job.title}`);
        console.log(`   Company: ${job.company.display_name}`);
        console.log(`   Location: ${job.location.display_name}`);
        console.log(`   Salary: ${job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'Not specified'}`);
        console.log(`   Posted: ${job.created.substring(0, 10)}`);
        console.log();
      });
    }

    console.log('✅ All queries successful! Your Adzuna API is working.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Response:', error.response?.data);
  }
}

testAdzunaAPI();
