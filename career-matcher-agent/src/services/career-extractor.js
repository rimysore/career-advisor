/**
 * Extract new career information from Claude's response
 * Returns structured career data, not raw text
 */
function extractCareerFromResponse(responseText, userQuestion) {
  // Look for career role mentions
  const careerPattern = /(?:role|position|career|job|title)[:\s]+([A-Z][a-zA-Z0-9\s\-\/]{3,50}?)(?:\n|\.|\||$)/gi;
  
  let match;
  let extractedCareer = null;

  while ((match = careerPattern.exec(responseText)) !== null) {
    const careerTitle = match[1].trim();
    if (isValidCareerTitle(careerTitle)) {
      extractedCareer = {
        title: careerTitle,
        id: careerTitle.toLowerCase().replace(/\s+/g, '-'),
        source: 'user_query'
      };
      break;
    }
  }

  return extractedCareer;
}

/**
 * Validate career title
 */
function isValidCareerTitle(title) {
  if (!title || title.length < 3 || title.length > 100) return false;
  if (title.match(/^(and|or|the|a|an)$/i)) return false;
  if (title.includes('**') || title.includes('###')) return false;
  return true;
}

module.exports = { extractCareerFromResponse };
