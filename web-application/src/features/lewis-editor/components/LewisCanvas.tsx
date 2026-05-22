import { useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AtomNode } from './AtomNode';
import { BondEdge } from './BondEdge';
import { useLewisEditor } from '../hooks/useLewisEditor';
import { AtomPalette } from './AtomPalette';
import { AtomInfoPanel } from './AtomInfoPanel';
import { MoleculeReadout } from './MoleculeReadout';
import type { AtomNodeType } from './AtomNode';
import type { BondEdgeType } from './BondEdge';

const nodeTypes: NodeTypes = { atom: AtomNode };
const edgeTypes: EdgeTypes = { bond: BondEdge };

export function LewisCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    cycleEdgeOrder,
    onDrop,
    onDragOver,
    clearAll,
    deleteSelectedElements,
    selectedNode,
  } = useLewisEditor();

  const typedNodes = nodes as AtomNodeType[];
  const typedEdges = edges as BondEdgeType[];
  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  return (
    <>
      {/* Reveal handles when hovering a node; keep them hidden otherwise */}
      <style>{`
        .lewis-atom-node:hover .react-flow__handle,
        .react-flow__node.selected .lewis-atom-node .react-flow__handle {
          opacity: 1 !important;
        }
        .react-flow__handle-connecting,
        .react-flow__handle-valid {
          opacity: 1 !important;
          background: #E2603F !important;
          border-color: white !important;
        }
        /* Remove default React Flow handle background so ours shows */
        .react-flow__handle { background: transparent; }
      `}</style>

      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        <AtomPalette />

        <div
          style={{
            flex: 1,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1.5px solid rgba(26,46,59,0.14)',
            background: '#FDFAF5',
            minHeight: 0,
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onEdgeClick={cycleEdgeOrder}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            deleteKeyCode="Delete"
            style={{ width: '100%', height: '100%' }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="rgba(26,46,59,0.1)"
            />
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                display: 'flex',
                gap: 6,
              }}
            >
              {hasSelection && (
                <ToolButton onClick={deleteSelectedElements} variant="danger">
                  Delete
                </ToolButton>
              )}
              <ToolButton onClick={clearAll} variant="secondary">
                Clear
              </ToolButton>
            </div>
          </ReactFlow>
        </div>

        <div
          style={{
            width: 180,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <AtomInfoPanel selectedNode={selectedNode} edges={typedEdges} />
          <MoleculeReadout nodes={typedNodes} edges={typedEdges} />
          <HintBox />
        </div>
      </div>
    </>
  );
}

function ToolButton({
  onClick,
  variant,
  children,
}: {
  onClick: () => void;
  variant: 'danger' | 'secondary';
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const bg =
    variant === 'danger'
      ? hovered ? '#c44e3a' : '#A03E2E'
      : hovered ? '#3a5060' : '#4A6275';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '5px 10px',
        border: 'none',
        borderRadius: 6,
        background: bg,
        color: 'white',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontWeight: 600,
        fontSize: '0.75rem',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function HintBox() {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.5)',
        border: '1px solid rgba(26,46,59,0.1)',
        borderRadius: 8,
        padding: '10px 12px',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: '0.72rem',
        color: '#4A6275',
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: '#1A2E3B' }}>Tips</strong>
      <ul style={{ margin: '4px 0 0', paddingLeft: 14 }}>
        <li>Drag atoms from palette onto canvas</li>
        <li>Hover an atom → dots appear; drag a dot to another atom to bond</li>
        <li>Click a bond to cycle 1→2→3</li>
        <li>Delete key removes selected</li>
      </ul>
    </div>
  );
}
