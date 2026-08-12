import { useCallback, useMemo, useState, useEffect } from 'react';
import dagre from 'dagre';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { GitBranch, Layers, Filter, SaveAll } from 'lucide-react';

// Audio context for sound effects
let audioContext = null;

function getAudioContext() {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime); // Frequency in hertz
    oscillator.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silently fail if audio context creation fails
    console.warn('Could not play click sound:', e);
  }
}

const nodeTypes = { custom: CustomNode };

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function getLayoutedElements(nodes, edges, direction = 'LR') {
  const isHorizontal = direction === 'LR';
  // Adjust spacing: wide ranksep for LR gives breathing room between folders
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 20 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 40 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      type: 'custom',
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 160 / 2,
        y: nodeWithPosition.y - 40 / 2,
      },
      data: {
        ...node.data,
        isRoot: node.id === 'root',
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
      }
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Formats edges with animated styling.
 */
function formatEdges(rawEdges) {
  return rawEdges.map((e) => ({
    ...e,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.4)', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 12,
      height: 12,
      color: 'rgba(99, 102, 241, 0.4)',
    },
  }));
}

export default function GraphView({ repoData, onNodeClick }) {
  const [filterFolders, setFilterFolders] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Filter nodes if toggle is on — show only folders + root
  const filteredData = useMemo(() => {
    if (!repoData) return { nodes: [], edges: [] };

    let nodes = repoData.nodes;
    let edges = repoData.edges;

    if (filterFolders) {
      const folderIds = new Set(
        nodes.filter((n) => n.data.type === 'folder' || n.id === 'root').map((n) => n.id)
      );
      nodes = nodes.filter((n) => folderIds.has(n.id));
      edges = edges.filter((e) => folderIds.has(e.source) && folderIds.has(e.target));
    }

    return { nodes, edges };
  }, [repoData, filterFolders]);

  const { nodes: layoutedNodes, edges: styledEdgesRaw } = useMemo(
    () => getLayoutedElements(filteredData.nodes, filteredData.edges, 'LR'),
    [filteredData]
  );

  const styledEdges = useMemo(
    () => formatEdges(styledEdgesRaw),
    [styledEdgesRaw]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);

  // Sync when layoutedNodes or styledEdges change
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(styledEdges);
  }, [layoutedNodes, styledEdges, setNodes, setEdges]);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
    // Fit view with some padding after initial render
    setTimeout(() => instance.fitView({ padding: 0.2 }), 100);
  }, []);

  // Handle node click with sound effect
  const handleNodeClickWithSound = useCallback((event, node) => {
    // Play subtle click sound
    playClickSound();

    // Call the original onNodeClick handler if provided
    if (onNodeClick) {
      onNodeClick(event, node);
    }
  }, [onNodeClick]);

  const handleExport = useCallback(async () => {
    if (!reactFlowInstance) return;
    try {
      const imageBlob = await reactFlowInstance.getImage();
      const url = window.URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codegraph.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export graph:', err);
    }
  }, [reactFlowInstance]);

  if (!repoData) {
    return (
      <div className="graph-container glass-card">
        <div className="graph-placeholder">
          <div className="graph-placeholder-icon">
            <GitBranch size={28} />
          </div>
          <h3>Architecture Graph</h3>
          <p>
            Enter a GitHub repository URL above to visualize its file structure as an interactive dependency graph.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-container glass-card">
      {/* Toolbar */}
      <div className="graph-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c7d2fe', fontWeight: 500, fontSize: '13px' }}>
          🧩 Code Structure Map
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`graph-toolbar-btn ${filterFolders ? 'active' : ''}`}
          onClick={() => setFilterFolders(!filterFolders)}
          title="Toggle: show folders only"
        >
          <Filter size={14} />
          {filterFolders ? 'All Files' : 'Folders Only'}
        </button>
          <div className="graph-toolbar-btn" style={{ cursor: 'default' }}>
            <Layers size={14} />
            {filteredData.nodes.length} nodes
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="graph-toolbar-btn"
            onClick={handleExport}
            title="Export graph as PNG"
          >
            <SaveAll size={14} />
          </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClickWithSound}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(99, 102, 241, 0.06)" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isRoot) return '#6366f1';
            if (node.data?.type === 'folder') return 'rgba(99,102,241,0.4)';
            return 'rgba(100,116,139,0.3)';
          }}
          maskColor="rgba(6, 8, 15, 0.85)"
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
