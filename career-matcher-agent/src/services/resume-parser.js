/**
 * Resume Parser - Extracts text and skills from resumes with PDF support
 */

const pdfParse = require('pdf-parse/legacy/build/pdf.js');

const KNOWN_SKILLS = [
  'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'TypeScript',
  'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud',
  'Terraform', 'Jenkins', 'GitHub Actions', 'GitLab CI',
  'Linux', 'Unix', 'Windows Server',
  'Git', 'REST API', 'GraphQL', 'Microservices',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
  'Data Science', 'Statistics', 'Analytics',
  'HTML', 'CSS', 'Figma', 'Design', 'UI/UX',
  'CI/CD', 'DevOps', 'Cloud Architecture', 'System Design',
  'Agile', 'Scrum', 'Kanban', 'Leadership', 'Management',
  'Communication', 'Project Management', 'Problem Solving',
  'AWS Lambda', 'Firebase', 'Elasticsearch', 'Apache Kafka'
];

const JOB_TITLES = [
  'Software Engineer', 'Developer', 'Senior Developer',
  'DevOps Engineer', 'Cloud Engineer', 'Backend Developer',
  'Frontend Developer', 'Full Stack Developer', 'Mobile Developer',
  'Data Scientist', 'ML Engineer', 'Data Engineer',
  'QA Engineer', 'Product Manager', 'Tech Lead',
  'Engineering Manager', 'Solutions Architect', 'Systems Engineer'
];

/**
 * Extract text from resume (supports PDF and plain text)
 */
async function extractResumeText(fileContent, mimeType) {
  try {
    // If PDF
    if (mimeType === 'application/pdf' || fileContent.toString('utf8', 0, 4) === '%PDF') {
      const data = await pdfParse(fileContent);
      return data.text || '';
    }
    // If plain text or DOC
    return fileContent.toString('utf8');
  } catch (error) {
    console.error('Error extracting text:', error.message);
    // Fallback to plain text extraction
    try {
      return fileContent.toString('utf8');
    } catch (e) {
      return '';
    }
  }
}

/**
 * Extract skills from resume text
 */
function extractSkills(resumeText) {
  const skills = new Set();
  const lowerText = resumeText.toLowerCase();

  KNOWN_SKILLS.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

/**
 * Extract job titles from resume
 */
function extractJobTitles(resumeText) {
  const titles = new Set();
  const lowerText = resumeText.toLowerCase();

  JOB_TITLES.forEach(title => {
    if (lowerText.includes(title.toLowerCase())) {
      titles.add(title);
    }
  });

  return Array.from(titles);
}

/**
 * Calculate ATS Score (0-100)
 */
function calculateATSScore(resumeText) {
  let score = 0;

  // 1. Contact Info (15 points)
  if (resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) {
    score += 5;
  }
  if (resumeText.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/)) {
    score += 5;
  }
  if (resumeText.match(/linkedin|github|portfolio/i)) {
    score += 5;
  }

  // 2. Formatting (20 points)
  const lines = resumeText.split('\n');
  if (lines.length > 10) score += 5;
  if (resumeText.includes('EXPERIENCE') || resumeText.includes('WORK HISTORY')) {
    score += 5;
  }
  if (resumeText.includes('EDUCATION') || resumeText.includes('SCHOOL')) {
    score += 5;
  }
  if (resumeText.includes('SKILLS')) {
    score += 5;
  }

  // 3. Keywords (30 points)
  const skills = extractSkills(resumeText);
  const jobTitles = extractJobTitles(resumeText);
  
  if (skills.length >= 5) score += 10;
  else if (skills.length >= 3) score += 5;
  
  if (jobTitles.length >= 2) score += 10;
  else if (jobTitles.length >= 1) score += 5;
  
  if (resumeText.toLowerCase().includes('achievement') || 
      resumeText.toLowerCase().includes('responsibility')) {
    score += 5;
  }

  // 4. Experience (20 points)
  const yearMatch = resumeText.match(/20\d{2}|19\d{2}/g);
  if (yearMatch && yearMatch.length >= 2) {
    score += 10;
  }
  if (resumeText.match(/\d+\s*(years?|yrs?)/i)) {
    score += 10;
  }

  // 5. Skills Listed (15 points)
  if (skills.length >= 8) score += 15;
  else if (skills.length >= 5) score += 10;
  else if (skills.length >= 3) score += 5;

  return Math.min(score, 100);
}

/**
 * Get ATS Feedback
 */
function getATSFeedback(score) {
  if (score >= 85) {
    return {
      level: 'Excellent',
      tips: [
        '✅ Resume is ATS-friendly',
        '✅ Good keyword density',
        'Consider adding more quantifiable achievements'
      ]
    };
  } else if (score >= 70) {
    return {
      level: 'Good',
      tips: [
        '✅ Decent ATS score',
        'Add more relevant keywords',
        'Make sure contact info is clearly visible',
        'Use standard section headers (SKILLS, EXPERIENCE)'
      ]
    };
  } else if (score >= 50) {
    return {
      level: 'Fair',
      tips: [
        '⚠️ Missing key sections',
        'Add SKILLS section explicitly',
        'Include contact information (email, phone)',
        'Add job titles and years of experience',
        'Use standard formatting'
      ]
    };
  } else {
    return {
      level: 'Needs Work',
      tips: [
        '❌ Major ATS issues',
        'Restructure with clear sections: CONTACT, EXPERIENCE, EDUCATION, SKILLS',
        'Add measurable achievements and numbers',
        'Include relevant keywords for your industry',
        'Use standard font and formatting'
      ]
    };
  }
}

module.exports = {
  extractResumeText,
  extractSkills,
  extractJobTitles,
  calculateATSScore,
  getATSFeedback
};
