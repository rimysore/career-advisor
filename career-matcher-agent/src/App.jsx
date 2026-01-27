import { useState } from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('http://localhost:3000/api/career-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        throw new Error('API Error: ' + response.status);
      }

      const data = await response.json();
      if (data.success) {
        setAnswer(data.answer);
      } else {
        setError('Error: ' + data.error);
      }
    } catch (err) {
      setError('Error: ' + err.message + '. Make sure API is running on localhost:3000');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAsk();
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>🚀 Career Transition Advisor</h1>
          <p>AI-Powered Career Analysis with Real Job Market Data</p>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Example: I am a Python developer with 3 years experience. I want to become an AI Engineer. What jobs are available and can I do it in 6 months?"
            rows="4"
            disabled={loading}
          />
          <div className="button-group">
            <button 
              onClick={handleAsk} 
              disabled={loading || !question.trim()}
              className="btn-primary"
            >
              {loading ? '⏳ Analyzing...' : '🎯 Get Career Advice'}
            </button>
            <p className="hint">Tip: Ctrl+Enter to submit</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-section">
            <p>❌ {error}</p>
          </div>
        )}

        {/* Answer Display */}
        {answer && (
          <div className="answer-section">
            <div className="answer-content">
              {answer.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
                if (line.trim() === '') return <div key={i} style={{ height: '10px' }} />;
                if (line.startsWith('| ')) return <p key={i} className="table-line">{line}</p>;
                if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
                if (line.startsWith('**')) {
                  return <p key={i} className="bold">{line.replace(/\*\*/g, '')}</p>;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>🤖 Agent analyzing real job market data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
