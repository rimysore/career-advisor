// Comprehensive skill list
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
  'Agile', 'Scrum', 'Kanban', 'Leadership',
  'Communication', 'Project Management', 'Problem Solving'
];

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract skills from response
 */
function extractSkillsFromResponse(responseText) {
  const skills = new Set();

  // Search for known skills in response
  KNOWN_SKILLS.forEach(skill => {
    try {
      const escapedSkill = escapeRegex(skill);
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
      if (regex.test(responseText)) {
        skills.add(skill);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not process skill: ${skill}`);
    }
  });

  return Array.from(skills);
}

module.exports = { extractSkillsFromResponse };
