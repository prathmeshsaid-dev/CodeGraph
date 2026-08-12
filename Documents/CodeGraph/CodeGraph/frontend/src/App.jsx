import { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
import axios from 'axios';
import { Search, Zap, GitBranch, ExternalLink, ArrowLeft } from 'lucide-react';
import GraphView from './components/GraphView';
import StatsBar from './components/StatsBar';
import LanguageStats from './components/LanguageStats';

// Lazy load components for better performance
const ChatPanel = lazy(() => import('./components/ChatPanel'));
const FileViewer = lazy(() => import('./components/FileViewer'));

// Debounce hook to prevent excessive function calls
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Main application component.
 * Orchestrates the hero landing → analyzed workspace transition.
 */
export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [debouncedRepoUrl, setDebouncedRepoUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dependencies, setDependencies] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [codeQuality, setCodeQuality] = useState(null);
  const [activeTab, setActiveTab] = useState('graph');
  const [repoHistory, setRepoHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference, or default to dark
    const savedTheme = localStorage.getItem('codegraph-theme');
    return savedTheme === 'light' ? false : true;
  });

  // Apply theme class to body element
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
    localStorage.setItem('codegraph-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialize theme on first load based on localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('codegraph-theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      // Check system preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Debounce repoUrl input to prevent excessive API calls
  useEffect(() => {
    setDebouncedRepoUrl(repoUrl);
  }, [repoUrl]);

  // Use debouncedRepoUrl for triggering analysis to prevent excessive API calls
  // We'll use this in our analysis functions instead of repoUrl directly

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Stable onClose function for FileViewer to prevent unnecessary re-renders
  const handleFileClose = useCallback(() => {
    setSelectedFile(null);
  }, []);

  async function handleAnalyze(e) {
    e?.preventDefault();
    const url = debouncedRepoUrl.trim();
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
      // Add to history on successful analysis
      addToHistory(url);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // New analysis functions
  async function analyzeDependencies() {
    if (!debouncedRepoUrl) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/dependencies', { url: debouncedRepoUrl });
      setDependencies(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function generateLearningPath(userLevel = 'beginner') {
    if (!debouncedRepoUrl) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/learning-path', {
        url: debouncedRepoUrl,
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
    if (!debouncedRepoUrl) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/code-quality', { url: debouncedRepoUrl });
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

  // Get a random demo repository for fun surprises
  function getRandomDemoRepo() {
    const demoRepos = [
      'https://github.com/expressjs/express',
      'https://github.com/microsoft/vscode',
      'https://github.com/tensorflow/tensorflow',
      'https://github.com/facebook/react',
      'https://github.com/ipping/git',
      'https://github.com/nodejs/node',
      'https://github.com/facebook/react-native',
      'https://github.com/microsoft/TypeScript',
      'https://github.com/angular/angular',
      'https://github.com/vuejs/vue'
    ];
    return demoRepos[Math.floor(Math.random() * demoRepos.length)];
  }

  // Load repository history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('codegraphRepoHistory');
    if (savedHistory) {
      try {
        setRepoHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.warn('Failed to parse repo history from localStorage', e);
      }
    }
  }, []);

  // Save repository history to localStorage
  useEffect(() => {
    localStorage.setItem('codegraphRepoHistory', JSON.stringify(repoHistory));
  }, [repoHistory]);

  // Add a repository to history (avoiding duplicates, max 10 items)
  function addToHistory(url) {
    if (!url) return;

    // Remove if already exists (to move it to front)
    const updatedHistory = repoHistory.filter(item => item !== url);
    // Add to front and limit to 10 items
    const newHistory = [url, ...updatedHistory].slice(0, 10);
    setRepoHistory(newHistory);
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
        <Header status="���������🟢 System Online" isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
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
            <button onClick={() => fillDemo(getRandomDemoRepo())} className="demo-repo-random">
              Random Repo
            </button>
          </div>

          {/* Repository History */}
          {repoHistory.length > 0 && (
            <div className="repo-history">
              <label htmlFor="history-select" className="history-label">
                Recently Analyzed:
              </label>
              <select
                id="history-select"
                className="history-select"
                onChange={(e) => {
                  if (e.target.value) {
                    setRepoUrl(e.target.value);
                  }
                }}
                value={repoUrl}
              >
                <option value="">Select a repository...</option>
                {repoHistory.map((url, index) => (
                  <option key={index} value={url}>
                    {url.replace('https://github.com/', '')}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Analyzed Workspace State ───
  return (
    <div className="app-container">
      <Header status="���������������������🟢 System Online" isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
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
                              <p><strong>Strengths:</strong> </p>
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

          {/* Language Statistics */}
          {repoData && repoData.stats.language_stats && (
            <div className="sidebar-section">
              <LanguageStats languageStats={repoData.stats.language_stats} />
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
                <Suspense fallback={<div className="glass-card">Loading AI Copilot...</div>}>
                  <ChatPanel
                    treeText={repoData.tree_text}
                    hasRepo={true}
                    repoUrl={repoUrl}
                  />
                </Suspense>
              )}

              {activeTab === 'file' && selectedFile && (
                <Suspense fallback={<div className="glass-card">Loading File Viewer...</div>}>
                  <FileViewer
                    repoUrl={repoUrl}
                    filePath={selectedFile}
                    onClose={handleFileClose}
                  />
                </Suspense>
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
const Header = memo(({ status, isDarkMode, toggleTheme }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>CodeGraph</h1>
          <p>Developer Onboarding Copilot</p>
        </div>
        <div className="header-status">
          <div className="theme-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="11"></line>
                <line x1="12" y1="13" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="11" y2="12"></line>
                <line x1="13" y1="12" x2="23" y2="12"></line>
              </svg>
            )}
          </div>
          <span>{status}</span>
        </div>
      </div>
    </header>
  );
}