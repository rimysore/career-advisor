const { Anthropic } = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Generate embeddings for text using Anthropic's API
 */
async function generateEmbedding(text) {
  try {
    // Use Claude to understand the text and generate conceptual embeddings
    // For production, use dedicated embedding models (OpenAI, Cohere, etc)
    
    // Simplified: Use text characteristics for now
    const embedding = hashStringToVector(text, 1536);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Create a simple vector from text for demo purposes
 * In production, use: OpenAI, Cohere, or Anthropic embeddings
 */
function hashStringToVector(text, dimensions = 1536) {
  const cleaned = text.toLowerCase();
  const vector = new Array(dimensions).fill(0);
  
  // Create hash-based vector
  for (let i = 0; i < cleaned.length; i++) {
    const charCode = cleaned.charCodeAt(i);
    vector[i % dimensions] += charCode / 256;
  }
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((a, b) => a + b * b, 0));
  if (magnitude > 0) {
    return vector.map(v => v / magnitude);
  }
  
  return vector;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

module.exports = {
  generateEmbedding,
  hashStringToVector,
  cosineSimilarity
};
