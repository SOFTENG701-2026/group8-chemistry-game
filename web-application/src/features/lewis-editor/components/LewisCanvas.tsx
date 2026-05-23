import { useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  getStraightPath,
  type NodeTypes,
  type EdgeTypes,
  type ConnectionLineComponentProps,
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
const ATOM_NODE_SIZE = 44;
const connectionLineContainerStyle: React.CSSProperties = {
  zIndex: 0,
  pointerEvents: 'none',
};

type LewisCanvasProps = {
  resetKey?: number;
};

type SelectionBox = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

function CenteredConnectionLine({
  fromNode,
  toNode,
  toHandle,
  toX,
  toY,
  connectionStatus,
  connectionLineStyle,
}: ConnectionLineComponentProps<AtomNodeType>) {
  const sourceX =
    fromNode.internals.positionAbsolute.x + (fromNode.measured.width ?? ATOM_NODE_SIZE) / 2;
  const sourceY =
    fromNode.internals.positionAbsolute.y + (fromNode.measured.height ?? ATOM_NODE_SIZE) / 2;
  const shouldSnapToTarget =
    toNode !== null &&
    toHandle?.type === 'target' &&
    toHandle.id === 'atom-target' &&
    connectionStatus === 'valid';
  const targetX = shouldSnapToTarget
    ? toNode.internals.positionAbsolute.x + (toNode.measured.width ?? ATOM_NODE_SIZE) / 2
    : toX;
  const targetY = shouldSnapToTarget
    ? toNode.internals.positionAbsolute.y + (toNode.measured.height ?? ATOM_NODE_SIZE) / 2
    : toY;
  const [path] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <path
      d={path}
      fill="none"
      stroke="#1A2E3B"
      strokeWidth={2}
      strokeLinecap="round"
      style={connectionLineStyle}
    />
  );
}

export function LewisCanvas({ resetKey }: LewisCanvasProps) {
  const isFirstRender = useRef(true);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [previewedAtomId, setPreviewedAtomId] = useState<string | null>(null);
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
    selectNodesInScreenRect,
    selectedNodes,
  } = useLewisEditor();

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    clearAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const typedNodes = nodes as AtomNodeType[];
  const typedEdges = edges as BondEdgeType[];
  const displayNodes = typedNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isPreviewed: node.id === previewedAtomId,
    },
  }));
  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);
  const selectionBoxStyle = selectionBox
    ? {
        left: Math.min(selectionBox.startX, selectionBox.currentX),
        top: Math.min(selectionBox.startY, selectionBox.currentY),
        width: Math.abs(selectionBox.currentX - selectionBox.startX),
        height: Math.abs(selectionBox.currentY - selectionBox.startY),
      }
    : null;

  function beginRightClickSelection(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 2 || !canvasRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    canvasRef.current.setPointerCapture(event.pointerId);

    const bounds = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
  }

  function updateRightClickSelection(event: React.PointerEvent<HTMLDivElement>) {
    if (!selectionBox || !canvasRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const bounds = canvasRef.current.getBoundingClientRect();
    setSelectionBox((box) =>
      box
        ? {
            ...box,
            currentX: event.clientX - bounds.left,
            currentY: event.clientY - bounds.top,
          }
        : null,
    );
  }

  function finishRightClickSelection(event: React.PointerEvent<HTMLDivElement>) {
    if (!selectionBox || !canvasRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    canvasRef.current.releasePointerCapture(event.pointerId);

    const bounds = canvasRef.current.getBoundingClientRect();
    const endX = event.clientX - bounds.left;
    const endY = event.clientY - bounds.top;
    const distance = Math.hypot(endX - selectionBox.startX, endY - selectionBox.startY);

    if (distance > 4) {
      selectNodesInScreenRect({
        x1: bounds.left + selectionBox.startX,
        y1: bounds.top + selectionBox.startY,
        x2: event.clientX,
        y2: event.clientY,
      });
    }

    setSelectionBox(null);
  }

  return (
    <>
      {/* Reveal handles when hovering a node; keep them hidden otherwise */}
      <style>{`
        .lewis-atom-node:hover .lewis-atom-source,
        .react-flow__node.selected .lewis-atom-node .lewis-atom-source {
          opacity: 1 !important;
        }
        .lewis-atom-source.react-flow__handle-connecting,
        .lewis-atom-source.react-flow__handle-valid {
          opacity: 1 !important;
          background: #E2603F !important;
          border-color: white !important;
        }
        .lewis-atom-target.react-flow__handle,
        .lewis-atom-target.react-flow__handle-connecting,
        .lewis-atom-target.react-flow__handle-valid {
          opacity: 1 !important;
          background: transparent !important;
          border: none !important;
        }
        .lewis-atom-node:has(.lewis-atom-target.react-flow__handle-valid) {
          box-shadow:
            0 0 0 3px rgba(226,96,63,0.28),
            0 0 0 6px rgba(226,96,63,0.12),
            0 2px 6px rgba(0,0,0,0.12) !important;
        }
        .lewis-atom-node:has(.lewis-atom-target.react-flow__handle-valid)::after {
          content: "";
          position: absolute;
          inset: -5px;
          border: 2px solid #E2603F;
          border-radius: 50%;
          pointer-events: none;
        }
        .react-flow__connectionline {
          z-index: 0 !important;
          pointer-events: none;
        }
        .react-flow__nodes {
          z-index: 5 !important;
        }
        .react-flow__node {
          z-index: 5 !important;
        }
        /* Remove default React Flow handle background so ours shows */
        .react-flow__handle { background: transparent; }
      `}</style>

      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        <AtomPalette />

        <div
          ref={canvasRef}
          onPointerDownCapture={beginRightClickSelection}
          onPointerMoveCapture={updateRightClickSelection}
          onPointerUpCapture={finishRightClickSelection}
          onPointerCancelCapture={() => setSelectionBox(null)}
          onContextMenu={(event) => event.preventDefault()}
          style={{
            flex: 1,
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1.5px solid rgba(26,46,59,0.14)',
            background: '#FDFAF5',
            minHeight: 0,
          }}
        >
          <ReactFlow
            nodes={displayNodes}
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
            connectionMode={ConnectionMode.Strict}
            connectionLineType={ConnectionLineType.Straight}
            connectionLineComponent={CenteredConnectionLine}
            connectionLineContainerStyle={connectionLineContainerStyle}
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
          {selectionBoxStyle && (
            <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: 20,
                border: '1.5px solid #E2603F',
                background: 'rgba(226,96,63,0.12)',
                borderRadius: 6,
                ...selectionBoxStyle,
              }}
            />
          )}
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
          <AtomInfoPanel
            selectedNodes={selectedNodes}
            edges={typedEdges}
            onPreviewAtomChange={setPreviewedAtomId}
          />
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
        <li>Drag atoms from the palette onto the canvas</li>
        <li>Start bonds from the edge of an atom</li>
        <li>Release on an atom to complete the bond</li>
        <li>Click a bond to toggle single/double</li>
        <li>Right-drag to box select atoms</li>
        <li>Delete key removes selected items</li>
      </ul>
    </div>
  );
}
