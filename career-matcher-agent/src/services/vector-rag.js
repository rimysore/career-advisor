const Career = require('../models/Career');
const { generateEmbedding, cosineSimilarity } = require('./embeddings');

/**
 * Search careers using vector similarity + keyword search
 */
async function searchCareersWithVectors(userQuestion) {
  console.log('\n🔍 RAG: Vector + Keyword Search...');
  console.log(`   Question: "${userQuestion}"`);

  try {
    // Step 1: Generate embedding for question
    console.log('   Generating question embedding...');
    const questionEmbedding = await generateEmbedding(userQuestion);
    
    if (!questionEmbedding) {
      console.log('   ⚠️  Embedding failed, using keyword search only');
      return await keywordSearch(userQuestion);
    }

    // Step 2: Get all careers
    const allCareers = await Career.find({});
    
    if (allCareers.length === 0) {
      console.log('   No careers in database');
      return [];
    }

    // Step 3: Generate embeddings for all careers (if missing)
    console.log(`   Processing ${allCareers.length} careers...`);
    for (const career of allCareers) {
      if (!career.embedding || career.embedding.length === 0) {
        const careerText = `${career.title} ${career.description} ${career.requiredSkills.join(' ')}`;
        career.embedding = await generateEmbedding(careerText);
        await career.save();
      }
    }

    // Step 4: Calculate similarity scores
    const scored = allCareers.map(career => ({
      ...career.toObject(),
      vectorScore: cosineSimilarity(questionEmbedding, career.embedding),
      keywordScore: calculateKeywordScore(userQuestion, career)
    }));

    // Step 5: Combine scores (70% vector, 30% keyword)
    const ranked = scored.map(item => ({
      ...item,
      finalScore: (item.vectorScore * 0.7) + (item.keywordScore * 0.3)
    }));

    // Step 6: Sort and return top 3
    const results = ranked
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 3)
      .filter(r => r.finalScore > 0.1);

    results.forEach((r, i) => {
      console.log(`   [${i + 1}] ${r.title} (score: ${r.finalScore.toFixed(2)})`);
    });

    return results;
  } catch (error) {
    console.error('   ❌ Vector search error:', error.message);
    return await keywordSearch(userQuestion);
  }
}

/**
 * Keyword search fallback
 */
async function keywordSearch(userQuestion) {
  console.log('   Falling back to keyword search...');
  const question = userQuestion.toLowerCase();
  
  const results = await Career.find({
    $or: [
      { title: { $regex: question, $options: 'i' } },
      { requiredSkills: { $regex: question, $options: 'i' } },
      { commonTransitions: { $regex: question, $options: 'i' } }
    ]
  }).limit(3);

  results.forEach((r, i) => {
    console.log(`   [${i + 1}] ${r.title}`);
  });

  return results;
}

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(question, career) {
  const q = question.toLowerCase();
  const title = career.title.toLowerCase();
  const description = (career.description || '').toLowerCase();
  const skills = (career.requiredSkills || []).map(s => s.toLowerCase()).join(' ');
  const transitions = (career.commonTransitions || []).map(s => s.toLowerCase()).join(' ');
  
  let score = 0;
  
  if (title.includes(q)) score += 0.8;
  if (description.includes(q)) score += 0.4;
  if (skills.includes(q)) score += 0.3;
  if (transitions.includes(q)) score += 0.2;
  
  // Partial word matches
  const words = q.split(' ');
  words.forEach(word => {
    if (word.length > 3) {
      if (title.includes(word)) score += 0.2;
      if (skills.includes(word)) score += 0.1;
    }
  });
  
  return Math.min(score, 1.0); // Cap at 1.0
}

function formatContextForClaude(searchResults) {
  if (searchResults.length === 0) {
    return 'No career database entries found.';
  }

  let context = 'CAREER DATABASE CONTEXT (Vector Search Results):\n';
  context += `(${searchResults.length} best matches from semantic search)\n\n`;
  
  searchResults.forEach((result, idx) => {
    context += `[${idx + 1}] ${result.title} (Match: ${(result.finalScore * 100).toFixed(0)}%)\n`;
    context += `    Description: ${result.description || 'N/A'}\n`;
    context += `    Required Skills: ${result.requiredSkills?.join(', ') || 'N/A'}\n`;
    context += `    Learning Timeline: ${result.timeline || 'N/A'}\n`;
    context += `    Salary Range: ${result.salaryRange || 'N/A'}\n\n`;
  });

  return context;
}

module.exports = { searchCareersWithVectors, formatContextForClaude };
