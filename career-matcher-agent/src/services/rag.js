const Career = require('../models/Career');

async function searchCareersInMongoDB(userQuestion) {
  const question = userQuestion.toLowerCase();
  
  console.log('\n🔍 RAG: Searching MongoDB...');
  console.log(`   Question: "${question}"`);

  try {
    // Text search using MongoDB indexes
    const results = await Career.find({
      $text: { $search: question }
    }).limit(3);

    if (results.length === 0) {
      console.log('   No text matches, trying keyword search...');
      // Fallback to keyword search
      const careers = await Career.find({
        $or: [
          { title: { $regex: question, $options: 'i' } },
          { requiredSkills: { $regex: question, $options: 'i' } },
          { commonTransitions: { $regex: question, $options: 'i' } }
        ]
      }).limit(3);
      
      careers.forEach(c => {
        console.log(`   ✓ Found: ${c.title}`);
      });
      return careers;
    }

    results.forEach(r => {
      console.log(`   ✓ Found: ${r.title}`);
    });

    return results;
  } catch (error) {
    console.error('   ⚠️  Search error:', error.message);
    return [];
  }
}

function formatContextForClaude(searchResults) {
  if (searchResults.length === 0) {
    return 'No career database entries found.';
  }

  let context = 'CAREER DATABASE CONTEXT:\n';
  context += `(${searchResults.length} entries from MongoDB)\n\n`;
  
  searchResults.forEach((result, idx) => {
    context += `[${idx + 1}] ${result.title}\n`;
    context += `    Description: ${result.description || 'N/A'}\n`;
    context += `    Required Skills: ${result.requiredSkills?.join(', ') || 'N/A'}\n`;
    context += `    Learning Timeline: ${result.timeline || 'N/A'}\n`;
    context += `    Salary Range: ${result.salaryRange || 'N/A'}\n`;
    context += `    Job Growth: ${result.jobGrowth || 'N/A'}\n\n`;
  });

  return context;
}

module.exports = { searchCareersInMongoDB, formatContextForClaude };
