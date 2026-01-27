import { useState } from 'react';
import { Logo } from './Logo';
import './App.css';

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
      const response = await fetch('http://localhost:3000/api/career-advice', {
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

        // Add to conversation history
        setConversationHistory([
          ...conversationHistory,
          { question: queryQuestion, answer: data.answer }
        ]);

        // Generate follow-up suggestions
        generateFollowUps(queryQuestion, data.answer);

        // Clear input if using custom question
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
    const lowerResponse = response.toLowerCase();

    // React/Frontend specific
    if (lowerQuestion.includes('react') || lowerQuestion.includes('frontend')) {
      suggestions.push({
        text: '💼 What companies are hiring React developers?',
        query: 'What are the top companies hiring React/Frontend developers right now?'
      });
      suggestions.push({
        text: '📈 How to move from React to Full-Stack?',
        query: 'How can I transition from React developer to Full-Stack developer?'
      });
      suggestions.push({
        text: '🔧 React skills to learn next?',
        query: 'What advanced React skills should I learn to increase my salary prospects?'
      });
    }

    // DevOps/Cloud specific
    if (lowerQuestion.includes('devops') || lowerQuestion.includes('cloud')) {
      suggestions.push({
        text: '🚀 DevOps certifications worth getting?',
        query: 'What are the best DevOps certifications (AWS, Kubernetes) and their ROI?'
      });
      suggestions.push({
        text: '💻 Companies hiring DevOps engineers?',
        query: 'Which companies are actively hiring DevOps engineers right now?'
      });
      suggestions.push({
        text: '⚡ DevOps salary expectations?',
        query: 'What is the realistic salary range for DevOps engineers in 2026?'
      });
    }

    // Data Science specific
    if (lowerQuestion.includes('data scientist') || lowerQuestion.includes('machine learning')) {
      suggestions.push({
        text: '📊 ML frameworks to master?',
        query: 'What machine learning frameworks and tools should I focus on?'
      });
      suggestions.push({
        text: '🎓 Best ML certifications?',
        query: 'What are the most valuable machine learning certifications?'
      });
      suggestions.push({
        text: '💰 Data Scientist salary by level?',
        query: 'What is the salary progression for data scientists from junior to senior?'
      });
    }

    // Backend specific
    if (lowerQuestion.includes('backend') || lowerQuestion.includes('node')) {
      suggestions.push({
        text: '🔐 Backend security best practices?',
        query: 'What are critical security concepts every backend developer should know?'
      });
      suggestions.push({
        text: '⚙️ Microservices vs Monolithic?',
        query: 'Should I learn microservices architecture or monolithic first?'
      });
      suggestions.push({
        text: '💾 Database design tips?',
        query: 'What database design patterns are most important for backend engineers?'
      });
    }

    // General career questions
    if (lowerResponse.includes('salary') || lowerQuestion.includes('salary')) {
      suggestions.push({
        text: '💵 How to negotiate salary?',
        query: 'How should I negotiate my salary as a tech professional?'
      });
    }

    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push({
        text: '📋 Resume tips for this role?',
        query: 'What should I include in my resume for this career path?'
      });
      suggestions.push({
        text: '🎯 Interview preparation?',
        query: 'How should I prepare for interviews in this field?'
      });
      suggestions.push({
        text: '🚀 How to stand out?',
        query: 'What can I do to stand out from other candidates?'
      });
    }

    setFollowUpSuggestions(suggestions.slice(0, 3)); // Limit to 3 suggestions
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
      {/* Full Width Header */}
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

      {/* Main Content */}
      <div className={`main-content ${hasSearched ? 'split' : 'single'}`}>
        
        {/* Left Section */}
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

              {/* Follow-up Suggestions */}
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

        {/* Right Section - Only shows after search */}
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
                <p>No jobs found at the moment. Try asking about a different role!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
