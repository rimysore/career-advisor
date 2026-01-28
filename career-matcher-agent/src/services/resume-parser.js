/**
 * Resume Parser - Extracts text and skills from resumes
 */

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

async function extractResumeText(fileContent, mimeType) {
  try {
    let text = fileContent.toString('utf8');
    text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ');
    return text;
  } catch (error) {
    console.error('Error extracting text:', error.message);
    return '';
  }
}

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

function calculateATSScore(resumeText) {
  let score = 0;
  if (resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) score += 5;
  if (resumeText.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/)) score += 5;
  if (resumeText.match(/linkedin|github|portfolio/i)) score += 5;
  
  const lines = resumeText.split('\n');
  if (lines.length > 10) score += 5;
  if (resumeText.includes('EXPERIENCE') || resumeText.includes('WORK HISTORY')) score += 5;
  if (resumeText.includes('EDUCATION') || resumeText.includes('SCHOOL')) score += 5;
  if (resumeText.includes('SKILLS')) score += 5;
  
  const skills = extractSkills(resumeText);
  const jobTitles = extractJobTitles(resumeText);
  if (skills.length >= 5) score += 10;
  else if (skills.length >= 3) score += 5;
  if (jobTitles.length >= 2) score += 10;
  else if (jobTitles.length >= 1) score += 5;
  if (resumeText.toLowerCase().includes('achievement') || resumeText.toLowerCase().includes('responsibility')) score += 5;
  
  const yearMatch = resumeText.match(/20\d{2}|19\d{2}/g);
  if (yearMatch && yearMatch.length >= 2) score += 10;
  if (resumeText.match(/\d+\s*(years?|yrs?)/i)) score += 10;
  
  if (skills.length >= 8) score += 15;
  else if (skills.length >= 5) score += 10;
  else if (skills.length >= 3) score += 5;

  return Math.min(score, 100);
}

function getATSFeedback(score) {
  if (score >= 85) {
    return { level: 'Excellent', tips: ['✅ Resume is ATS-friendly', '✅ Good keyword density'] };
  } else if (score >= 70) {
    return { level: 'Good', tips: ['✅ Decent ATS score', 'Add more relevant keywords'] };
  } else if (score >= 50) {
    return { level: 'Fair', tips: ['⚠️ Missing key sections', 'Add SKILLS section explicitly'] };
  } else {
    return { level: 'Needs Work', tips: ['❌ Major ATS issues', 'Restructure with clear sections'] };
  }
}

module.exports = {
  extractResumeText,
  extractSkills,
  extractJobTitles,
  calculateATSScore,
  getATSFeedback
};
