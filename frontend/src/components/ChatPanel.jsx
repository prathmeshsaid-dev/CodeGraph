import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Sparkles, Bot, Search } from 'lucide-react';

const SUGGESTIONS = [
  "What's the main entry point of this project?",
  "Explain the folder structure",
  "What technologies does this project use?",
  "How should I set up local development?",
];

/**
 * Renders markdown-ish text with basic formatting:
 * bold, inline code, code blocks, and line breaks.
 */
function renderMarkdown(text) {
  if (!text) return '';

  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
      return (
        <pre key={i}>
          <code>{code}</code>
        </pre>
      );
    }

    // Process inline formatting
    const lines = part.split('\n');
    return lines.map((line, j) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

      return (
        <span key={`${i}-${j}`}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {j < lines.length - 1 && <br />}
        </span>
      );
    });
  });
}

export default function ChatPanel({ treeText, hasRepo, repoUrl }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('developer'); // 'developer' or 'beginner'
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(question) {
    const q = question || input.trim();
    if (!q) return;

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ask', {
        question: q,
        context: treeText || 'No repository analyzed yet.',
        url: repoUrl,
        mode: mode
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.data.answer || res.data.error || 'No response received.',
        retrievedFiles: res.data.retrieved_files || []
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**Error:** ${err.response?.data?.error || err.message}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-panel glass-card">
      {/* Header */}
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="chat-header-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>AI Copilot</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ask anything about this codebase</span>
          </div>
        </div>
        {hasRepo && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '11px', padding: '4px 8px' }}
            >
              <option value="developer">🧑‍💻 Developer Mode</option>
              <option value="beginner">🧠 Beginner Mode</option>
            </select>
            <button 
              onClick={() => sendMessage('Give me a project summary, key files, and the main flow.')}
              style={{ background: 'var(--accent-gradient)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', padding: '4px 8px', cursor: 'pointer', fontWeight: 500 }}
              title="Show Key Insights"
            >
              ⚡ Insights
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <Bot size={22} />
            </div>
            <h4>Welcome, Developer!</h4>
            <p>
              {hasRepo
                ? "I've analyzed the repository. Ask me anything about the codebase!"
                : 'Analyze a repo first, then ask me questions about its architecture and code.'}
            </p>

            {hasRepo && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="chat-suggestion-btn"
                    onClick={() => sendMessage(s)}
                  >
                    <MessageSquare size={12} style={{ display: 'inline', marginRight: 6 }} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              {msg.retrievedFiles && msg.retrievedFiles.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Search size={10} /> Analyzed Files
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {msg.retrievedFiles.map(f => (
                      <span key={f} style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="typing-indicator">
            <span />
            <span />
            <span />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          className="chat-input"
          type="text"
          placeholder={hasRepo ? 'Ask about the codebase...' : 'Analyze a repo first...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          title="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
