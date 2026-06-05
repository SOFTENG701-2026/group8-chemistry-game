import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  addEdge,
  getStraightPath,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  type EdgeMouseHandler,
  type IsValidConnection,
  type ConnectionLineComponentProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AtomNode } from './AtomNode';
import { BondEdge } from './BondEdge';
import type { AtomNodeType } from './AtomNode';
import type { BondEdgeType } from './BondEdge';
import type { MolGraph, MolBond } from '../../chem-assembler/data/molecularGraph';
import type { Level2ErrorType } from '../../chem-assembler/types';
import { ELEMENTS } from '../data/elements';
import type { BondOrder } from '@app/shared';

const HINT_EDGE_ID = '__hint__';
const ATOM_RADIUS = 22;
const ATOM_NODE_SIZE = 44;
const nodeTypes: NodeTypes = { atom: AtomNode };
const edgeTypes: EdgeTypes = { bond: BondEdge };
const connectionLineContainerStyle: React.CSSProperties = {
  zIndex: 0,
  pointerEvents: 'none',
};

function usedBonds(nodeId: string, edgeList: BondEdgeType[], excludeId?: string): number {
  return edgeList.reduce((sum, e) => {
    if (e.id === excludeId || e.data?.isHint) return sum;
    if (e.source === nodeId || e.target === nodeId) return sum + (e.data?.order ?? 1);
    return sum;
  }, 0);
}

function validateBonds(drawn: BondEdgeType[], expected: MolBond[]): boolean {
  const real = drawn.filter(e => !e.data?.isHint);
  if (real.length !== expected.length) return false;
  const key = (s: string, t: string) => [s, t].sort().join('|');
  const drawnMap = new Map<string, number>();
  for (const e of real) drawnMap.set(key(e.source, e.target), e.data?.order ?? 1);
  for (const b of expected) {
    if (drawnMap.get(key(b.source, b.target)) !== b.order) return false;
  }
  return true;
}

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
      stroke="var(--text)"
      strokeWidth={2}
      strokeLinecap="round"
      style={connectionLineStyle}
    />
  );
}

export type BondsOnlyCanvasHandle = {
  validate: () => boolean;
  reset: () => void;
  flashNextHint: () => void;
  diagnose: () => Level2ErrorType;
};

type Props = {
  graph: MolGraph;
  resetKey?: number;
};

function graphToNodes(graph: MolGraph): AtomNodeType[] {
  return graph.atoms.map((a) => ({
    id: a.id,
    type: 'atom' as const,
    position: { x: a.position.x - ATOM_RADIUS, y: a.position.y - ATOM_RADIUS },
    data: { element: a.element },
    draggable: false,
    selectable: false,
  }));
}

export const BondsOnlyCanvas = forwardRef<BondsOnlyCanvasHandle, Props>(
  function BondsOnlyCanvas({ graph, resetKey }, ref) {
    const [nodes, , onNodesChange] = useNodesState<AtomNodeType>(graphToNodes(graph));
    const [edges, setEdges, onEdgesChange] = useEdgesState<BondEdgeType>([]);
    const hintIdxRef = useRef(0);
    const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      setEdges([]);
    }, [resetKey, setEdges]);

    useImperativeHandle(ref, () => ({
      validate: () => validateBonds(edges as BondEdgeType[], graph.bonds),
      reset: () => setEdges([]),
      diagnose: (): Level2ErrorType => {
        const real = (edges as BondEdgeType[]).filter(e => !e.data?.isHint);
        const expected = graph.bonds;
        if (real.length < expected.length) return 'too_few_bonds';
        if (real.length > expected.length) return 'too_many_bonds';
        const drawnOrders = real.map(e => e.data?.order ?? 1).sort();
        const expectedOrders = expected.map(b => b.order).sort();
        const orderMatch = drawnOrders.every((o, i) => o === expectedOrders[i]);
        return orderMatch ? 'wrong_structure' : 'wrong_bond_order';
      },
      flashNextHint: () => {
        if (graph.bonds.length === 0) return;

        // Advance to next bond (cycle)
        const bond = graph.bonds[hintIdxRef.current % graph.bonds.length];
        hintIdxRef.current = (hintIdxRef.current + 1) % graph.bonds.length;

        // Clear any existing hint edge + timer
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
        setEdges(eds => [
          ...eds.filter(e => e.id !== HINT_EDGE_ID),
          {
            id: HINT_EDGE_ID,
            source: bond.source,
            target: bond.target,
            type: 'bond',
            data: { order: 1, isHint: true },
            selectable: false,
          } as BondEdgeType,
        ]);

        hintTimerRef.current = setTimeout(() => {
          setEdges(eds => eds.filter(e => e.id !== HINT_EDGE_ID));
          hintTimerRef.current = null;
        }, 1500);
      },
    }), [edges, graph.bonds, setEdges]);

    const isValidConnection: IsValidConnection = (connection) => {
      if (connection.source === connection.target) return false;
      const typedEdges = edges as BondEdgeType[];
      const typedNodes = nodes as AtomNodeType[];
      const alreadyConnected = typedEdges.some(
        e => !e.data?.isHint &&
          ((e.source === connection.source && e.target === connection.target) ||
           (e.source === connection.target && e.target === connection.source))
      );
      if (alreadyConnected) return false;
      const srcUsed = usedBonds(connection.source, typedEdges);
      const tgtUsed = usedBonds(connection.target, typedEdges);
      const srcValence = ELEMENTS[typedNodes.find(n => n.id === connection.source)?.data.element ?? '']?.valence ?? Infinity;
      const tgtValence = ELEMENTS[typedNodes.find(n => n.id === connection.target)?.data.element ?? '']?.valence ?? Infinity;
      return srcUsed < srcValence && tgtUsed < tgtValence;
    };

    const onConnect: OnConnect = (connection) => {
      setEdges((eds) => {
        const typedEds = eds as BondEdgeType[];
        const typedNodes = nodes as AtomNodeType[];
        const alreadyConnected = typedEds.some(
          e => !e.data?.isHint &&
            ((e.source === connection.source && e.target === connection.target) ||
             (e.source === connection.target && e.target === connection.source))
        );
        if (alreadyConnected) return eds;
        const srcUsed = usedBonds(connection.source, typedEds);
        const tgtUsed = usedBonds(connection.target, typedEds);
        const srcValence = ELEMENTS[typedNodes.find(n => n.id === connection.source)?.data.element ?? '']?.valence ?? Infinity;
        const tgtValence = ELEMENTS[typedNodes.find(n => n.id === connection.target)?.data.element ?? '']?.valence ?? Infinity;
        if (srcUsed >= srcValence || tgtUsed >= tgtValence) return eds;
        return addEdge<BondEdgeType>({ ...connection, type: 'bond', data: { order: 1 } }, eds);
      });
    };

    const selectedEdge = (edges as BondEdgeType[]).find(e => e.selected && !e.data?.isHint) ?? null;

    const deleteSelectedEdge = () => {
      if (!selectedEdge) return;
      setEdges(eds => eds.filter(e => e.id !== selectedEdge.id));
    };

    const selectOrCycleEdgeOrder: EdgeMouseHandler<BondEdgeType> = (event, edge) => {
      event.stopPropagation();
      if (edge.data?.isHint) return;

      if (!edge.selected) {
        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            selected: e.id === edge.id,
          })),
        );
        return;
      }

      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edge.id) return e;
          const current: BondOrder = e.data?.order ?? 1;
          const proposed: BondOrder = current === 2 ? 1 : 2;
          if (proposed > current) {
            const typedEds = eds as BondEdgeType[];
            const typedNodes = nodes as AtomNodeType[];
            const srcFree = (ELEMENTS[typedNodes.find(n => n.id === e.source)?.data.element ?? '']?.valence ?? Infinity) - usedBonds(e.source, typedEds, e.id);
            const tgtFree = (ELEMENTS[typedNodes.find(n => n.id === e.target)?.data.element ?? '']?.valence ?? Infinity) - usedBonds(e.target, typedEds, e.id);
            if (proposed > srcFree || proposed > tgtFree) return e;
          }
          return { ...e, data: { order: proposed } };
        }),
      );
    };

    return (
      <div className="lewis-bonds-only-canvas" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <style>{`
          .lewis-atom-node:hover .lewis-atom-source,
          .react-flow__node.selected .lewis-atom-node .lewis-atom-source {
            opacity: 1 !important;
          }
          .lewis-atom-source.react-flow__handle-connecting,
          .lewis-atom-source.react-flow__handle-valid {
            opacity: 1 !important;
            background: var(--accent) !important;
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
            border: 2px solid var(--accent);
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
          .react-flow__handle { background: transparent; }
        `}</style>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onEdgeClick={selectOrCycleEdgeOrder}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Strict}
          connectionLineType={ConnectionLineType.Straight}
          connectionLineComponent={CenteredConnectionLine}
          connectionLineContainerStyle={connectionLineContainerStyle}
          fitView
          nodesDraggable={false}
          edgesReconnectable={false}
          connectionDragThreshold={5}
          connectOnClick={false}
          deleteKeyCode="Delete"
          style={{ width: '100%', height: '100%' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--grid-dot)" />
        </ReactFlow>

        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: 8,
          padding: '10px 14px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          zIndex: 10,
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text)' }}>Tips</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 14 }}>
            <li>Hover an atom to reveal handles</li>
            <li>Drag a handle to another atom to bond</li>
            <li>Select a bond, then click it again to toggle single/double</li>
            <li>Delete key removes the selected bond</li>
          </ul>
          <button
            onClick={deleteSelectedEdge}
            disabled={!selectedEdge}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '4px 0',
              borderRadius: 6,
              border: '1px solid',
              borderColor: selectedEdge ? 'var(--danger)' : 'var(--panel-border)',
              background: selectedEdge ? 'var(--danger)' : 'transparent',
              color: selectedEdge ? '#fff' : 'var(--muted-2)',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              cursor: selectedEdge ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            Delete bond
          </button>
        </div>
      </div>
    );
  },
);
