import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, FileCode, AlertCircle, Copy, Check } from 'lucide-react';

export default function FileViewer({ repoUrl, filePath, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchFile() {
      try {
        setLoading(true);
        setError('');
        
        const res = await axios.post('/api/file', {
          url: repoUrl,
          path: filePath
        });
        
        setContent(res.data.content);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load file');
      } finally {
        setLoading(false);
      }
    }

    if (filePath) {
      fetchFile();
    }
  }, [repoUrl, filePath]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!filePath) return null;

  return (
    <div className="file-viewer-overlay fade-in-up">
      <div className="file-viewer-modal glass-card">
        {/* Header */}
        <div className="file-viewer-header">
          <div className="file-viewer-title">
            <FileCode size={16} className="text-accent" />
            <span>{filePath}</span>
          </div>
          <div className="file-viewer-actions">
            {!loading && !error && (
              <button onClick={copyToClipboard} className="icon-btn" title="Copy code">
                {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              </button>
            )}
            <button onClick={onClose} className="icon-btn close-btn" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="file-viewer-content">
          {loading ? (
            <div className="file-viewer-loading">
              <div className="spinner-large" />
              <p>Fetching file content...</p>
            </div>
          ) : error ? (
            <div className="file-viewer-error">
              <AlertCircle size={32} color="#fb7185" />
              <p>{error}</p>
              <p className="text-sm text-muted">The file might be a binary file, an image, or too large to display.</p>
            </div>
          ) : (
            <pre className="code-block">
              <code>{content}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
