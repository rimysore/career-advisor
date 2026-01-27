import { useState } from 'react';
import { Logo } from './Logo';
import './App.css';

// PRODUCTION URL - HARDCODED
const API_URL = 'https://career-advisor-2dkz.onrender.com';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [jobs, setJobs] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleAsk = async (customQuestion = null) => {
    const queryQuestion = customQuestion || question;
    if (!queryQuestion.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');
    setJobs([]);
    setCareers([]);
    setFollowUpSuggestions([]);

    try {
      const response = await fetch(`${API_URL}/api/career-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryQuestion })
      });

      if (!response.ok) {
        throw new Error('API Error: ' + response.status);
      }

      const data = await response.json();
      if (data.success) {
        setAnswer(data.answer);
        setJobs(data.jobs || []);
        setCareers(data.careers || []);
        setHasSearched(true);

        setConversationHistory([
          ...conversationHistory,
          { question: queryQuestion, answer: data.answer }
        ]);

        generateFollowUps(queryQuestion, data.answer);

        if (customQuestion) {
          setQuestion('');
        }
      } else {
        setError(data.error || 'Error processing request');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUps = (originalQuestion, response) => {
    const suggestions = [];
    const lowerQuestion = originalQuestion.toLowerCase();

    if (lowerQuestion.includes('software') || lowerQuestion.includes('developer')) {
      suggestions.push({
        text: '💼 What companies are hiring developers?',
        query: 'What are top tech companies hiring software developers right now?'
      });
      suggestions.push({
        text: '📈 How to increase my salary as a developer?',
        query: 'How can I increase my salary as a software developer?'
      });
      suggestions.push({
        text: '🚀 Frontend vs Backend - which to learn?',
        query: 'Should I specialize in frontend or backend development?'
      });
    } else if (lowerQuestion.includes('devops') || lowerQuestion.includes('cloud')) {
      suggestions.push({
        text: '🚀 DevOps certifications worth getting?',
        query: 'What are the best DevOps certifications (AWS, Kubernetes)?'
      });
      suggestions.push({
        text: '💻 Companies hiring DevOps engineers?',
        query: 'Which companies are actively hiring DevOps engineers?'
      });
    } else {
      suggestions.push({
        text: '📋 Resume tips for this role?',
        query: 'What should I include in my resume for this career?'
      });
      suggestions.push({
        text: '🎯 How to stand out?',
        query: 'What can I do to stand out as a candidate?'
      });
    }

    setFollowUpSuggestions(suggestions.slice(0, 3));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAsk();
    }
  };

  const handleFollowUp = (followUpQuery) => {
    handleAsk(followUpQuery);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-text">
            <h1>Career Advisor</h1>
            <p>AI-powered guidance with real job opportunities</p>
          </div>
          <div className="header-logo">
            <Logo />
          </div>
        </div>
      </header>

      <div className={`main-content ${hasSearched ? 'split' : 'single'}`}>
        <div className="left-section">
          <div className="card input-card">
            <h2>Your Question</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Example: I want to transition to DevOps Engineer..."
              disabled={loading}
              className="input-textarea"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="btn-primary"
            >
              {loading ? 'Analyzing...' : 'Get Career Guidance'}
            </button>
          </div>

          {error && (
            <div className="card error-card">
              <p className="error-text">❌ {error}</p>
            </div>
          )}

          {loading && (
            <div className="card loading-card">
              <div className="spinner"></div>
              <p>Analyzing career opportunities...</p>
            </div>
          )}

          {answer && (
            <div className="card analysis-card">
              <h2>Career Analysis</h2>
              <div className="analysis-content">
                {answer.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h3 key={i} className="section-title">{line.replace(/^#+\s/, '')}</h3>;
                  }
                  if (line.startsWith('## ')) {
                    return <h4 key={i} className="subsection-title">{line.replace(/^#+\s/, '')}</h4>;
                  }
                  if (line.trim() === '') return <div key={i} className="spacer"></div>;
                  if (line.startsWith('- ')) {
                    return <li key={i} className="list-item">{line.replace(/^-\s/, '')}</li>;
                  }
                  if (line.trim()) {
                    return <p key={i}>{line}</p>;
                  }
                  return null;
                })}
              </div>

              {followUpSuggestions.length > 0 && (
                <div className="followup-section">
                  <h3>Continue Exploring?</h3>
                  <div className="followup-buttons">
                    {followUpSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFollowUp(suggestion.query)}
                        disabled={loading}
                        className="btn-followup"
                      >
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasSearched && (
          <div className="right-section">
            {careers.length > 0 && (
              <div className="card careers-card">
                <h2>Matched Roles</h2>
                <div className="careers-list">
                  {careers.map((career, idx) => (
                    <div key={idx} className="career-item">
                      <div className="career-rank">#{idx + 1}</div>
                      <div className="career-info">
                        <h4>{career.title}</h4>
                        <div className="career-score">Match: {(career.score * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {jobs.length > 0 && (
              <div className="card jobs-card">
                <h2>Available Opportunities</h2>
                <div className="jobs-count">{jobs.length} jobs found</div>
                <div className="jobs-list">
                  {jobs.map((job, idx) => (
                    <div key={idx} className="job-item">
                      <div className="job-header">
                        <h3 className="job-title">{job.title}</h3>
                        <span className="job-rank">#{idx + 1}</span>
                      </div>
                      <p className="job-company">{job.company}</p>
                      <p className="job-location">📍 {job.location}</p>
                      {job.salary && <p className="job-salary">💰 {job.salary}</p>}
                      <p className="job-posted">Posted: {job.posted}</p>
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-apply">
                        View & Apply →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && answer && jobs.length === 0 && (
              <div className="card no-jobs">
                <p>No jobs found. Try another role!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
