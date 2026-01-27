require('dotenv').config();
const axios = require('axios');

async function testJobQueries() {
  console.log('🎯 TESTING REAL JOB QUERIES\n');

  try {
    const response = await axios.get('https://remoteok.io/api');
    const allJobs = response.data;

    // Test Case 1: Data Scientist
    console.log('TEST 1: Searching for Data Scientist');
    console.log('─'.repeat(50));
    const test1 = allJobs.filter(j => j.title?.toLowerCase().includes('data scientist')).slice(0, 2);
    test1.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Test Case 2: AI Engineer
    console.log('TEST 2: Searching for AI Engineer');
    console.log('─'.repeat(50));
    const test2 = allJobs.filter(j => j.title?.toLowerCase().includes('ai')).slice(0, 2);
    test2.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Test Case 3: Python Developer
    console.log('TEST 3: Searching for Python Developer');
    console.log('─'.repeat(50));
    const test3 = allJobs.filter(j => j.title?.toLowerCase().includes('python')).slice(0, 2);
    test3.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Test Case 4: Machine Learning
    console.log('TEST 4: Searching for Machine Learning');
    console.log('─'.repeat(50));
    const test4 = allJobs.filter(j => j.title?.toLowerCase().includes('machine learning')).slice(0, 2);
    test4.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Test Case 5: Frontend Developer
    console.log('TEST 5: Searching for Frontend Developer');
    console.log('─'.repeat(50));
    const test5 = allJobs.filter(j => j.title?.toLowerCase().includes('frontend')).slice(0, 2);
    test5.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Test Case 6: Backend Developer
    console.log('TEST 6: Searching for Backend Developer');
    console.log('─'.repeat(50));
    const test6 = allJobs.filter(j => j.title?.toLowerCase().includes('backend')).slice(0, 2);
    test6.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Test Case 7: Product Manager
    console.log('TEST 7: Searching for Product Manager');
    console.log('─'.repeat(50));
    const test7 = allJobs.filter(j => j.title?.toLowerCase().includes('product manager')).slice(0, 2);
    test7.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Test Case 8: DevOps
    console.log('TEST 8: Searching for DevOps');
    console.log('─'.repeat(50));
    const test8 = allJobs.filter(j => j.title?.toLowerCase().includes('devops')).slice(0, 2);
    test8.forEach(job => console.log(`✓ ${job.title} @ ${job.company}`));
    console.log();

    // Summary
    console.log('═'.repeat(50));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Total jobs in database: ${allJobs.length}`);
    console.log(`Data Scientists: ${allJobs.filter(j => j.title?.toLowerCase().includes('data scientist')).length}`);
    console.log(`AI/ML Engineers: ${allJobs.filter(j => j.title?.toLowerCase().includes('ai')).length}`);
    console.log(`Python Developers: ${allJobs.filter(j => j.title?.toLowerCase().includes('python')).length}`);
    console.log(`Frontend Developers: ${allJobs.filter(j => j.title?.toLowerCase().includes('frontend')).length}`);
    console.log(`Backend Developers: ${allJobs.filter(j => j.title?.toLowerCase().includes('backend')).length}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testJobQueries();
