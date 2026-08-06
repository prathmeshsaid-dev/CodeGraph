import { useState } from 'react';
import axios from 'axios';
import { Search, Zap, GitBranch, ExternalLink, ArrowLeft } from 'lucide-react';
import GraphView from './components/GraphView';
import ChatPanel from './components/ChatPanel';
import StatsBar from './components/StatsBar';
import FileViewer from './components/FileViewer';

/**
 * Main application component.
 * Orchestrates the hero landing → analyzed workspace transition.
 */
export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  async function handleAnalyze(e) {
    e?.preventDefault();
    const url = repoUrl.trim();
    if (!url) return;

    setLoading(true);
    setError('');
    setRepoData(null);

    try {
      const res = await axios.post('/api/analyze', { url });
      setRepoData(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Quick-fill demo repos
  function fillDemo(url) {
    setRepoUrl(url);
  }

  const handleNodeClick = (event, node) => {
    if (node.data?.type === 'file' && node.data?.path) {
      setSelectedFile(node.data.path);
    }
  };

  // ─── Hero / Landing State ───
  if (!repoData) {
    return (
      <div className="app-container">
        <Header status="🟢 System Online" />
        <div className="hero-section">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Codebase Analysis
          </div>

          <h1 className="hero-title">
            Understand any repo
            <br />
            <span className="gradient-text">in seconds.</span>
          </h1>

          <p className="hero-description">
            Paste a GitHub URL to instantly visualize the architecture,
            explore dependencies, and chat with an AI that knows the codebase inside out.
          </p>

          <form onSubmit={handleAnalyze} className="hero-input-wrapper">
            <div className="repo-input-wrapper">
              <GitBranch size={18} className="repo-input-icon" />
              <input
                id="repo-url-input"
                className="repo-input"
                type="text"
                placeholder="Paste a GitHub repo to explore its architecture..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <button
              id="analyze-btn"
              type="submit"
              className="analyze-btn pulse-glow"
              disabled={loading || !repoUrl.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Analyzing…
                </>
              ) : (
                <>
                  ⚡ Analyze Repo
                </>
              )}
            </button>
          </form>

          {error && (
            <p style={{ color: '#fb7185', fontSize: 14, marginTop: 8 }}>
              ⚠ {error}
            </p>
          )}

          {/* Quick-fill demo repos */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              'https://github.com/expressjs/express',
              'https://github.com/pallets/flask',
              'https://github.com/facebook/react',
            ].map((url) => (
              <button
                key={url}
                onClick={() => fillDemo(url)}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 999,
                  color: '#94a3b8',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                  e.currentTarget.style.color = '#c7d2fe';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                <ExternalLink size={11} />
                {url.split('/').slice(-2).join('/')}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Analyzed / Workspace State ───
  return (
    <div className="app-container">
      <Header status={loading ? "🟡 Processing..." : "🟢 Indexed"} />
      <div className="main-content">
        {/* Top: input bar for re-analysis */}
        <form onSubmit={handleAnalyze} className="repo-input-section fade-in-up">
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setRepoData(null);
              setRepoUrl('');
            }}
            disabled={loading}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="repo-input-wrapper">
            <Search size={18} className="repo-input-icon" />
            <input
              id="repo-url-input-workspace"
              className="repo-input"
              type="text"
              placeholder="Analyze another repo…"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="analyze-btn"
            disabled={loading || !repoUrl.trim()}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Analyzing…
              </>
            ) : (
              <>
                <Zap size={16} />
                Analyze
              </>
            )}
          </button>
        </form>

        {error && (
          <p style={{ color: '#fb7185', fontSize: 14 }}>⚠ {error}</p>
        )}

        {/* Stats */}
        <StatsBar stats={repoData.stats} />

        {/* Graph + Chat workspace */}
        <div className="workspace fade-in-up fade-in-up-delay-2">
          <GraphView repoData={repoData} onNodeClick={handleNodeClick} />
          <ChatPanel treeText={repoData.tree_text} hasRepo={true} repoUrl={repoUrl} />
        </div>

        <FileViewer 
          repoUrl={repoUrl} 
          filePath={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      </div>
    </div>
  );
}

/**
 * Sticky header / navbar
 */
function Header({ status }) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">C</div>
        <div>
          <div className="header-title">CodeGraph</div>
          <div className="header-subtitle">Developer Onboarding Copilot</div>
        </div>
      </div>
      <div className="header-status">
        {status}
      </div>
    </header>
  );
}
