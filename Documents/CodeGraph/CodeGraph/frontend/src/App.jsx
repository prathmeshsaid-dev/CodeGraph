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
  const [dependencies, setDependencies] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [codeQuality, setCodeQuality] = useState(null);
  const [activeTab, setActiveTab] = useState('graph');

  async function handleAnalyze(e) {
    e?.preventDefault();
    const url = repoUrl.trim();
    if (!url) return;

    setLoading(true);
    setError('');
    setRepoData(null);
    setDependencies(null);
    setLearningPath(null);
    setCodeQuality(null);

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

  // New analysis functions
  async function analyzeDependencies() {
    if (!repoUrl) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/dependencies', { url: repoUrl });
      setDependencies(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function generateLearningPath(userLevel = 'beginner') {
    if (!repoUrl) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/learning-path', {
        url: repoUrl,
        user_level: userLevel
      });
      setLearningPath(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeCodeQuality() {
    if (!repoUrl) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/code-quality', { url: repoUrl });
      setCodeQuality(res.data);
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

          {/* Demo repos */}
          <div className="demo-repos">
            <button onClick={() => fillDemo('https://github.com/expressjs/express')}>
              Express.js
            </button>
            <button onClick={() => fillDemo('https://github.com/microsoft/vscode')}>
              VS Code
            </button>
            <button onClick={() => fillDemo('https://github.com/tensorflow/tensorflow')}>
              TensorFlow
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Analyzed Workspace State ───
  return (
    <div className="app-container">
      <Header status="🟢 System Online" />
      <div className="workspace">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h2>Repository</h2>
            <div className="repo-info">
              <p><strong>URL:</strong> {repoUrl}</p>
              {repoData && (
                <div className="repo-stats">
                  <p><strong>Files:</strong> {repoData.stats.files}</p>
                  <p><strong>Folders:</strong> {repoData.stats.folders}</p>
                  <p><strong>Language:</strong> {repoData.stats.language}</p>
                  <p><strong>Description:</strong> {repoData.stats.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Tools */}
          <div className="sidebar-section">
            <h2>Analysis Tools</h2>
            <div className="tool-buttons">
              <button
                onClick={analyzeDependencies}
                disabled={loading || !repoData}
                className="tool-btn"
                title="Analyze Dependencies"
              >
                <Zap size={16} /> Dependencies
              </button>
              <button
                onClick={() => generateLearningPath('beginner')}
                disabled={loading || !repoData}
                className="tool-btn"
                title="Generate Learning Path (Beginner)"
              >
                📚 Learning Path
              </button>
              <button
                onClick={analyzeCodeQuality}
                disabled={loading || !repoData}
                className="tool-btn"
                title="Analyze Code Quality"
              >
                🔍 Code Quality
              </button>
            </div>
          </div>

          {/* Results Sections */}
          {dependencies && (
            <div className="sidebar-section results-section">
              <h2>Dependencies</h2>
              <div className="results-content">
                <p><strong>Repository:</strong> {dependencies.repository}</p>
                <p><strong>Manifests Found:</strong> {dependencies.manifests_found.join(', ')}</p>
                {Object.keys(dependencies.dependencies).length > 0 && (
                  <div className="dependencies-list">
                    <h3>Dependencies Found:</h3>
                    <ul>
                      {Object.entries(dependencies.dependencies).map(([dep, version]) => (
                        <li key={dep} style={{ fontSize: '12px', margin: '2px 0' }}>
                          {dep}: {version || 'latest'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {learningPath && (
            <div className="sidebar-section results-section">
              <h2>Learning Path ({learningPath.user_level})</h2>
              <div className="results-content">
                <div className="learning-path-steps">
                  {learningPath.learning_path.map((step, index) => (
                    <div key={index} className="learning-step">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                      <p><strong>Time:</strong> {step.estimated_time_minutes} mins</p>
                      {step.files && step.files.length > 0 && (
                        <p><strong>Files:</strong> {step.files.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {codeQuality && (
            <div className="sidebar-section results-section">
              <h2>Code Quality Analysis</h2>
              <div className="results-content">
                <p><strong>Repository:</strong> {codeQuality.repository}</p>
                <p><strong>Files Analyzed:</strong> {codeQuality.files_analyzed}</p>
                <div className="quality-results">
                  {codeQuality.results.map((result, index) => (
                    <div key={index} className="quality-result">
                      <h4>{result.file}</h4>
                      {result.analysis.error ? (
                        <p className="error">Error: {result.analysis.error}</p>
                      ) : (
                        <>
                          <p><strong>Score:</strong> {result.analysis.overall_score || 'N/A'}/10</p>
                          {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                            <>
                              <p><strong>Strengths:</strong></p>
                              <ul>
                                {result.analysis.strengths.map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </>
                          )}
                          {result.analysis.issues && result.analysis.issues.length > 0 && (
                            <>
                              <p><strong>Issues Found:</strong></p>
                              <ul>
                                {result.analysis.issues.map((issue, i) => (
                                  <li key={i}>
                                    • <strong>{issue.type}:</strong> {issue.description}
                                    {issue.suggestion && ` (Suggestion: ${issue.suggestion})`}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {!repoData ? (
            <div className="placeholder">
              <h2>Repository Analysis</h2>
              <p>Analyze a GitHub repository to see its architecture graph, statistics, and AI-powered insights.</p>
            </div>
          ) : (
            <>
              <StatsBar stats={repoData.stats} />

              <div className="tabs">
                <button
                  className={`tab-button ${activeTab === 'graph' ? 'active' : ''}`}
                  onClick={() => setActiveTab('graph')}
                >
                  Architecture Graph
                </button>
                <button
                  className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  AI Copilot
                </button>
                <button
                  className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
                  onClick={() => setActiveTab('file')}
                >
                  File Viewer
                </button>
              </div>

              {activeTab === 'graph' && (
                <GraphView
                  repoData={repoData}
                  onNodeClick={handleNodeClick}
                />
              )}

              {activeTab === 'chat' && (
                <ChatPanel
                  treeText={repoData.tree_text}
                  hasRepo={true}
                  repoUrl={repoUrl}
                />
              )}

              {activeTab === 'file' && selectedFile && (
                <FileViewer
                  repoUrl={repoUrl}
                  filePath={selectedFile}
                  onClose={() => setSelectedFile(null)}
                />
              )}

              {activeTab === 'file' && !selectedFile && (
                <div className="file-placeholder">
                  <p>Click on a file in the graph to view its contents here.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Header component
function Header({ status }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>CodeGraph</h1>
          <p>Developer Onboarding Copilot</p>
        </div>
        <div className="header-status">{status}</div>
      </div>
    </header>
  );
}