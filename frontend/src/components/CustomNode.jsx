import { Handle, Position } from 'reactflow';
import { Folder, FileText, FileCode, FileJson, Image, Settings, Package, GitBranch } from 'lucide-react';

/**
 * Maps file extensions to icons and colors for visual variety in the graph.
 */
const FILE_ICON_MAP = {
  js: { icon: FileCode, color: '#fbbf24' },
  jsx: { icon: FileCode, color: '#fbbf24' },
  ts: { icon: FileCode, color: '#3b82f6' },
  tsx: { icon: FileCode, color: '#3b82f6' },
  py: { icon: FileCode, color: '#34d399' },
  json: { icon: FileJson, color: '#fb7185' },
  md: { icon: FileText, color: '#94a3b8' },
  css: { icon: FileCode, color: '#a78bfa' },
  scss: { icon: FileCode, color: '#ec4899' },
  html: { icon: FileCode, color: '#f97316' },
  svg: { icon: Image, color: '#22d3ee' },
  png: { icon: Image, color: '#22d3ee' },
  jpg: { icon: Image, color: '#22d3ee' },
  yml: { icon: Settings, color: '#94a3b8' },
  yaml: { icon: Settings, color: '#94a3b8' },
  toml: { icon: Settings, color: '#94a3b8' },
  lock: { icon: Package, color: '#64748b' },
  gitignore: { icon: GitBranch, color: '#64748b' },
};

function getFileInfo(label) {
  const ext = label.split('.').pop()?.toLowerCase();
  return FILE_ICON_MAP[ext] || { icon: FileText, color: '#64748b' };
}

/**
 * Custom node renderer for React Flow graph.
 * Renders folders, files, and the root node with distinct styles.
 */
export default function CustomNode({ data }) {
  const { label, type, targetPosition = 'left', sourcePosition = 'right' } = data;
  const isRoot = data.isRoot;
  const isFolder = type === 'folder';

  // Pick icon + color
  let Icon = Folder;
  let iconColor = '#818cf8';

  if (isRoot) {
    Icon = Package;
    iconColor = '#ffffff';
  } else if (!isFolder) {
    const info = getFileInfo(label);
    Icon = info.icon;
    iconColor = info.color;
  }

  const nodeClass = isRoot ? 'root' : isFolder ? 'folder' : 'file';

  return (
    <>
      {/* Input handle (top) — hidden for root */}
      {!isRoot && (
        <Handle
          type="target"
          position={targetPosition}
          style={{
            background: 'rgba(99,102,241,0.5)',
            border: 'none',
            width: 6,
            height: 6,
          }}
        />
      )}

      <div className={`custom-node ${nodeClass}`}>
        <Icon className="node-icon" size={16} color={iconColor} />
        <span>{label}</span>
      </div>

      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={sourcePosition}
        style={{
          background: 'rgba(99,102,241,0.5)',
          border: 'none',
          width: 6,
          height: 6,
        }}
      />
    </>
  );
}
