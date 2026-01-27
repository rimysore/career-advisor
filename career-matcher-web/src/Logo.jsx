export function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stairs */}
      <path d="M8 28V24H12V20H16V16H20V12H24V8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Person */}
      <circle cx="26" cy="6" r="2.5" fill="white" />
      <path d="M26 9V14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23 11H29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 15L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 15L30 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Briefcase */}
      <rect x="20" y="9" width="4" height="3" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M20 10L18 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
