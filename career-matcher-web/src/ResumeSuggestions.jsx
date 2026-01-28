import { useState } from 'react';
import './ResumeSuggestions.css';

const API_URL = 'https://career-advisor-2dkz.onrender.com';

export function ResumeSuggestions({ targetCareer }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a resume');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetCareer', targetCareer || 'Software Engineer');

      const response = await fetch(`${API_URL}/api/analyze-resume-for-career`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getATSColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  const getATSLevel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="resume-suggestions">
      {!result ? (
        <div className="upload-box">
          <h3>📄 Optimize Your Resume</h3>
          <p>For: <span className="career-name">{targetCareer || 'Your Target Role'}</span></p>

          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              disabled={loading}
              className="file-input"
              id="resume-file"
            />
            <label htmlFor="resume-file" className="file-label">
              📁 Choose Resume
            </label>
          </div>

          {file && <p className="file-name">✅ {file.name}</p>}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="btn-analyze"
          >
            {loading ? '⏳ Analyzing...' : '🚀 Analyze Resume'}
          </button>

          {error && <p className="error-msg">{error}</p>}
        </div>
      ) : (
        <div className="results-box">
          <button 
            onClick={() => setResult(null)} 
            className="btn-upload-new"
          >
            ← Upload Different Resume
          </button>

          {/* ATS Score Section */}
          <div className="ats-section">
            <div className="ats-score">
              <div 
                className="score-circle"
                style={{ borderColor: getATSColor(result.atsScore) }}
              >
                <span className="score-number">{result.atsScore}</span>
                <small>/100</small>
              </div>
              <div className="score-info">
                <h4>ATS Score</h4>
                <p className="score-level" style={{ color: getATSColor(result.atsScore) }}>
                  {getATSLevel(result.atsScore)}
                </p>
              </div>
            </div>
          </div>

          {/* Resume Improvements */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="improvements-section">
              <h4>✨ Personalized Resume Improvements</h4>
              <p className="subtitle">Make these changes to stand out for {result.targetCareer} roles</p>
              
              <div className="suggestions-list">
                {result.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="suggestion-item">
                    <div className="suggestion-header">
                      <span className="suggestion-icon">{suggestion.icon}</span>
                      <h5>{suggestion.title}</h5>
                    </div>
                    <p className="suggestion-description">{suggestion.description}</p>
                    <div className="suggestion-example">
                      <p className="example-label">Example:</p>
                      <p className="example-text">{suggestion.example}</p>
                    </div>
                    <div className="suggestion-benefit">
                      <span className="benefit-icon">⭐</span>
                      <p>{suggestion.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Gap */}
          {result.skillsGap && result.skillsGap.length > 0 && (
            <div className="skills-gap-section">
              <h4>🎯 Skills You Should Highlight</h4>
              <div className="skills-list">
                {result.skillsGap.map((skill, idx) => (
                  <span key={idx} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat">
              <p className="stat-value">{result.extractedSkills?.length || 0}</p>
              <p className="stat-label">Skills Found</p>
            </div>
            <div className="stat">
              <p className="stat-value">{result.matchPercentage || 0}%</p>
              <p className="stat-label">Role Match</p>
            </div>
            <div className="stat">
              <p className="stat-value">{result.keywords?.length || 0}</p>
              <p className="stat-label">Keywords</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
