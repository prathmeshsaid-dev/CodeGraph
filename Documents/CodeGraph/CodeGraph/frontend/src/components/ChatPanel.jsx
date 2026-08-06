import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Sparkles, Bot, Search, Zap } from 'lucide-react';

const SUGGESTIONS = [
  "What's the main entry point of this project?",
  "Explain the folder structure",
  "What technologies does this project use?",
  "How should I set up local development?",
  "Calculate the time complexity of the main algorithm",
  "Show me a plot of the performance data",
  "What is the statistical significance of the results?"
];

/**
 * Determines if a question is likely suited for mathematical computation
 * based on keywords indicating computation, math, data analysis, etc.
 */
function isMathQuestion(question) {
  const mathPatterns = [
    /calculate|compute|solve|simplify|differentiate|integrate|limit|derivative|integral/i,
    /equation|formula|expression/i,
    /time\s+complexity|big\s*o|o\(n\)/i,
    /graph|plot|chart/i,
    /matrix|vector|linear\s+algebra/i,
    /probability|statistic|mean|median|std|variance/i,
    /what\s+is\s+\d+[\+\-\*\/\^]\d+/i, // simple arithmetic
    /solve\s+\w+\s*=/i, // solving equations
    /plot\s+\w+/i, // plotting functions
    /find\s+the\s+(root|zero|maximum|minimum)/i,
    /derivative\s+of/i,
    /integral\s+of/i,
    /limit\s+as/i
  ];

  return mathPatterns.some(pattern => pattern.test(question));
}

/**
 * Extracts a mathematical expression from a question for computation
 */
function extractMathExpression(question) {
  // Remove common question words
  let cleaned = question.toLowerCase();
  cleaned = cleaned.replace(/^(what\s+is|calculate|compute|solve|find|tell\s+me|how\s+to)\s*/, '');

  // Look for mathematical patterns
  // Simple equations: x^2 + 2x + 1 = 0
  const eqMatch = cleaned.match(/([a-z]*\s*[0-9+\-*/^()\s.]+\s*[=<>]\s*[0-9+\-*/^()\s.]*)/);
  if (eqMatch) return eqMatch[1].trim();

  // Expressions: x^2 + 2x + 1
  const exprMatch = cleaned.match(/([a-z]*\s*[0-9+\-*/^()\s.]+)/);
  if (exprMatch) return exprMatch[1].trim();

  // If nothing specific found, return cleaned question
  return cleaned.replace(/[^a-z0-9+\-*/^().\s]/g, ' ').trim();
}

/**
 * Determines the likely mathematical operation from a question
 */
function determineMathOperation(question) {
  const lower = question.toLowerCase();

  if (/(differentiate|derivative|diff)/.test(lower)) return 'differentiate';
  if (/(integrate|integral)/.test(lower)) return 'integrate';
  if (/(solve|solve\s+for)/.test(lower)) return 'solve';
  if (/(expand)/.test(lower)) return 'expand';
  if (/(factor)/.test(lower)) return 'factor';
  if (/(limit)/.test(lower)) return 'limit';
  if (/(evaluate|compute|calculate)/.test(lower)) return 'eval';

  return 'simplify'; // default
}

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
  const [computing, setComputing] = useState(false); // For math computation state
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, computing]);

  async function sendMessage(question) {
    const q = question || input.trim();
    if (!q) return;

    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check if this is a mathematical question that should use computation
      if (isMathQuestion(q)) {
        setComputing(true);
        setLoading(false); // We'll handle loading state separately for computation

        const expression = extractMathExpression(q);
        const operation = determineMathOperation(q);

        const res = await axios.post('/api/compute', {
          query: q,
          expression: expression,
          operation: operation
        });

        const assistantMsg = {
          role: 'assistant',
          content: res.data.explanation ||
                  `**Result:** ${res.data.result}\n\n${res.data.steps?.map(s => `• ${s}`).join('\n') || ''}`,
          computationResult: res.data,
          isComputation: true
        };

        setMessages(prev => [...prev, assistantMsg]);
        setComputing(false);
      } else {
        // Regular AI-powered response
        setLoading(true);
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
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `**Error:** ${err.response?.data?.error || err.message}. Please try again.`,
        },
      ]);
      setLoading(false);
      setComputing(false);
    } finally {
      setLoading(false);
      setComputing(false);
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
                      <span key={f} style={{ background: 'rgba(99,102,241,0.2)', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#c7d2fe', border: '1px solid rgba(99,102,241,0.4)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {msg.isComputation && msg.computationResult && (
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,165,0,0.1)', borderRadius: '4px' }}>
                  <div style={{ fontSize: 11, color: '#ffa500', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={10} /> Computation Result
                  </div>
                  {msg.computationResult.steps && (
                    <div style={{ fontSize: 12, color: '#c7d2fe' }}>
                      <strong>Steps:</strong>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        {msg.computationResult.steps.map((step, idx) => (
                          <li key={idx} style={{ margin: '2px 0' }}>• {step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {msg.computationResult.latex_output && msg.computationResult.latex_output !== '' && (
                    <div style={{ margin: '8px 0', textAlign: 'center' }}>
                      {/* In a real app, you'd use a LaTeX renderer like KaTeX or MathJax here */}
                      <code style={{ background: 'rgba(99,102,241,0.15)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {msg.computationResult.latex_output}
                      </code>
                    </div>
                  )}
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
        {computing && (
          <div className="typing-indicator" style={{ background: 'rgba(255,165,0,0.2)' }}>
            <span style={{ background: '#ffa500' }} />
            <span style={{ background: '#ffa500' }} />
            <span style={{ background: '#ffa500' }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          className="chat-input"
          type="text"
          placeholder={hasRepo
            ? `Ask about the codebase... (Try: "calculate time complexity", "solve x^2+5x+6=0", "plot sin(x)")`
            : 'Analyze a repo first...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || computing}
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={loading || computing || !input.trim()}
          title="Send message"
        >
          {loading || computing ? (
            <>
              <div className="spinner" />
              {loading ? 'Thinking...' : 'Computing...'}
            </>
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}