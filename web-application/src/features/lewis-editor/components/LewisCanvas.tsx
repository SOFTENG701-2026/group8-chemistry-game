import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { IconMaximize, IconMinimize } from '@tabler/icons-react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
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
import { hillFormula, isConnected, allValencesSatisfied } from '../utils/moleculeUtils';
import { FORMULA_TO_NAME } from '../data/elements';
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
  onMoleculeChange?: (name: string | null) => void;
};

type SelectionBox = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type PendingAbsoluteViewport = {
  canvasLeft: number;
  canvasTop: number;
  viewportX: number;
  viewportY: number;
  zoom: number;
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

export function LewisCanvas({ resetKey, onMoleculeChange }: LewisCanvasProps) {
  const isFirstRender = useRef(true);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const paletteColumnRef = useRef<HTMLDivElement | null>(null);
  const sideColumnRef = useRef<HTMLDivElement | null>(null);
  const pendingAbsoluteViewport = useRef<PendingAbsoluteViewport | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [previewedAtomId, setPreviewedAtomId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [columnHeight, setColumnHeight] = useState<number | null>(null);
  const { setViewport } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    selectOrCycleEdgeOrder,
    selectOnlyNode,
    onDrop,
    onDragOver,
    clearAll,
    deleteSelectedElements,
    selectNodesInScreenRect,
    selectedNodes,
  } = useLewisEditor();

  function getRenderedViewport() {
    const viewport = canvasRef.current?.querySelector('.react-flow__viewport');
    const transform = viewport ? getComputedStyle(viewport).transform : 'none';
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (!matrix) return { x: 0, y: 0, zoom: 1 };

    const parts = matrix[1].split(',').map((part) => Number(part.trim()));
    return {
      x: parts[4] || 0,
      y: parts[5] || 0,
      zoom: parts[0] || 1,
    };
  }

  function setFullscreenKeepingAtomScreenPositions(nextIsFullscreen: boolean) {
    if (canvasRef.current) {
      const bounds = canvasRef.current.getBoundingClientRect();
      const viewport = getRenderedViewport();

      pendingAbsoluteViewport.current = {
        canvasLeft: bounds.left,
        canvasTop: bounds.top,
        viewportX: viewport.x,
        viewportY: viewport.y,
        zoom: viewport.zoom,
      };
    }

    setIsFullscreen(nextIsFullscreen);
  }

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    clearAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (!isFullscreen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setFullscreenKeepingAtomScreenPositions(false);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  useLayoutEffect(() => {
    if (!pendingAbsoluteViewport.current) return;

    let nextFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      nextFrame = window.requestAnimationFrame(() => {
        const pending = pendingAbsoluteViewport.current;
        const bounds = canvasRef.current?.getBoundingClientRect();
        if (!pending || !bounds) return;

        setViewport(
          {
            x: pending.viewportX + pending.canvasLeft - bounds.left,
            y: pending.viewportY + pending.canvasTop - bounds.top,
            zoom: pending.zoom,
          },
          { duration: 0 },
        );
        pendingAbsoluteViewport.current = null;
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(nextFrame);
    };
  }, [isFullscreen, setViewport]);

  useLayoutEffect(() => {
    if (isFullscreen) return;

    function updateColumnHeight() {
      const measuredColumns = [paletteColumnRef.current, sideColumnRef.current].filter(
        Boolean,
      ) as HTMLDivElement[];
      if (measuredColumns.length === 0) return;

      const nextHeight = Math.ceil(
        Math.max(
          ...measuredColumns.map((column) => {
            const content = column.firstElementChild;
            const contentHeight = content?.getBoundingClientRect().height ?? 0;
            return Math.max(column.getBoundingClientRect().height, column.scrollHeight, contentHeight);
          }),
        ),
      );

      setColumnHeight((current) => (current === nextHeight ? current : nextHeight));
    }

    updateColumnHeight();
    window.addEventListener('resize', updateColumnHeight);

    return () => window.removeEventListener('resize', updateColumnHeight);
  }, [edges.length, isFullscreen, selectedNodes.length]);

  useEffect(() => {
    if (!pendingAbsoluteViewport.current) return;

    const timeouts = [0, 80, 180].map((delay) =>
      window.setTimeout(() => {
        const pending = pendingAbsoluteViewport.current;
        const bounds = canvasRef.current?.getBoundingClientRect();
        if (!pending || !bounds) return;

        setViewport(
          {
            x: pending.viewportX + pending.canvasLeft - bounds.left,
            y: pending.viewportY + pending.canvasTop - bounds.top,
            zoom: pending.zoom,
          },
          { duration: 0 },
        );

        if (delay === 180) pendingAbsoluteViewport.current = null;
      }, delay),
    );

    return () => {
      for (const timeout of timeouts) window.clearTimeout(timeout);
    };
  }, [isFullscreen, setViewport]);

  useLayoutEffect(() => {
    if (!pendingAbsoluteViewport.current) return;

    const pending = pendingAbsoluteViewport.current;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;

    setViewport(
      {
        x: pending.viewportX + pending.canvasLeft - bounds.left,
        y: pending.viewportY + pending.canvasTop - bounds.top,
        zoom: pending.zoom,
      },
      { duration: 0 },
    );
  }, [isFullscreen, setViewport]);

  const typedNodes = nodes as AtomNodeType[];
  const typedEdges = edges as BondEdgeType[];

  const derivedName = useMemo(() => {
    if (typedNodes.length === 0) return null;
    if (!isConnected(typedNodes, typedEdges)) return null;
    if (!allValencesSatisfied(typedNodes, typedEdges)) return null;
    return FORMULA_TO_NAME[hillFormula(typedNodes)] ?? null;
  }, [typedNodes, typedEdges]);

  useEffect(() => {
    onMoleculeChange?.(derivedName);
  }, [derivedName, onMoleculeChange]);

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
        .lewis-editor-shell {
          display: flex;
          flex: 1;
          min-height: 0;
          width: 100%;
          height: 100%;
        }
        .lewis-editor-shell.is-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 1000;
          box-sizing: border-box;
          padding: 16px;
          background-color: #F5EFE1;
          background-image:
            linear-gradient(to right, rgba(26,46,59,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26,46,59,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .lewis-editor-main {
          display: flex;
          gap: 12px;
          flex: 1;
          min-height: 0;
          min-width: 0;
        }
        .lewis-editor-shell:not(.is-fullscreen) .lewis-editor-main {
          min-height: var(--lewis-editor-column-height, 100%);
        }
        .lewis-editor-palette {
          display: flex;
          flex-shrink: 0;
        }
        .lewis-editor-canvas {
          flex: 1;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid rgba(26,46,59,0.14);
          background: #FDFAF5;
          min-height: 0;
          min-width: 0;
        }
        .lewis-editor-side {
          width: 180px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: auto;
        }
        .lewis-editor-side > :last-child {
          flex: 1;
        }
        .lewis-editor-shell.is-fullscreen .lewis-editor-side {
          width: clamp(180px, 18vw, 240px);
        }
        .lewis-editor-shell.is-fullscreen .lewis-editor-canvas {
          border-radius: 10px;
        }
        @media (max-width: 720px) {
          .lewis-editor-shell.is-fullscreen {
            padding: 10px;
          }
          .lewis-editor-shell.is-fullscreen .lewis-editor-main {
            gap: 8px;
          }
          .lewis-editor-shell.is-fullscreen .lewis-editor-side {
            width: 160px;
          }
        }
      `}</style>

      <div
        className={`lewis-editor-shell${isFullscreen ? ' is-fullscreen' : ''}`}
        style={
          !isFullscreen && columnHeight
            ? ({ '--lewis-editor-column-height': `${columnHeight}px` } as React.CSSProperties)
            : undefined
        }
      >
      <div className="lewis-editor-main">
        <div className="lewis-editor-palette" ref={paletteColumnRef}>
          <AtomPalette />
        </div>

        <div
          className="lewis-editor-canvas"
          ref={canvasRef}
          onPointerDownCapture={beginRightClickSelection}
          onPointerMoveCapture={updateRightClickSelection}
          onPointerUpCapture={finishRightClickSelection}
          onPointerCancelCapture={() => setSelectionBox(null)}
          onContextMenu={(event) => event.preventDefault()}
        >
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onNodeClick={selectOnlyNode}
            onEdgeClick={selectOrCycleEdgeOrder}
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
            <div
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                zIndex: 10,
              }}
            >
              <IconToolButton
                label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                onClick={() => setFullscreenKeepingAtomScreenPositions(!isFullscreen)}
              >
                {isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
              </IconToolButton>
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

        <div className="lewis-editor-side" ref={sideColumnRef}>
          <AtomInfoPanel
            selectedNodes={selectedNodes}
            edges={typedEdges}
            onPreviewAtomChange={setPreviewedAtomId}
          />
          <MoleculeReadout nodes={typedNodes} edges={typedEdges} />
          <HintBox />
        </div>
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

function IconToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 29,
        height: 29,
        border: 'none',
        borderRadius: 6,
        background: hovered ? '#3a5060' : '#4A6275',
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        boxSizing: 'border-box',
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
        <li>Select a bond, then click it again to toggle single/double</li>
        <li>Right-drag to box select atoms</li>
        <li>Delete key removes selected items</li>
      </ul>
    </div>
  );
}
