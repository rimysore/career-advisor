import { useState } from 'react';
import { Logo } from './Logo';
import { ResumeSuggestions } from './ResumeSuggestions';
import './App.css';

const API_URL = 'https://career-advisor-2dkz.onrender.com';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);

  const handleAsk = async (customQuestion = null) => {
    const queryQuestion = customQuestion || question;
    if (!queryQuestion.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');
    setCareers([]);
    setFollowUpSuggestions([]);

    try {
      const response = await fetch(`${API_URL}/api/career-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryQuestion })
      });

      if (!response.ok) throw new Error('API Error: ' + response.status);

      const data = await response.json();
      if (data.success) {
        setAnswer(data.answer);
        setCareers(data.careers || []);
        setHasSearched(true);
        
        if (data.careers && data.careers.length > 0) {
          setSelectedCareer(data.careers[0].title);
        }

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
        text: '💼 What companies are hiring?',
        query: 'What tech companies are actively hiring software developers?'
      });
      suggestions.push({
        text: '📈 How to increase salary?',
        query: 'How can I increase my salary as a software developer?'
      });
    } else if (lowerQuestion.includes('devops') || lowerQuestion.includes('cloud')) {
      suggestions.push({
        text: '🚀 Best DevOps certifications?',
        query: 'What DevOps certifications should I pursue?'
      });
    } else {
      suggestions.push({
        text: '📋 Resume tips?',
        query: 'What should I include in my resume?'
      });
    }

    setFollowUpSuggestions(suggestions.slice(0, 2));
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
            <p>AI-powered guidance with resume optimization</p>
          </div>
          <div className="header-logo">
            <Logo />
          </div>
        </div>
      </header>

      <div className={`main-content ${hasSearched ? 'split' : 'single'}`}>
        <div className="left-section">
          <div className="card input-card">
            <h2>Your Career Question</h2>
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
              <p>Analyzing your career transition...</p>
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
                  <h3>Explore More?</h3>
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
            <ResumeSuggestions targetCareer={selectedCareer} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
