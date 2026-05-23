import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  addEdge,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  type OnEdgeClick,
  type IsValidConnection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AtomNode } from './AtomNode';
import { BondEdge } from './BondEdge';
import type { AtomNodeType } from './AtomNode';
import type { BondEdgeType } from './BondEdge';
import type { MolGraph, MolBond } from '../../chem-assembler/data/molecularGraph';
import { ELEMENTS } from '../data/elements';
import type { BondOrder } from '@app/shared';

const ATOM_RADIUS = 22;
const nodeTypes: NodeTypes = { atom: AtomNode };
const edgeTypes: EdgeTypes = { bond: BondEdge };

function usedBonds(nodeId: string, edgeList: BondEdgeType[], excludeId?: string): number {
  return edgeList.reduce((sum, e) => {
    if (e.id === excludeId) return sum;
    if (e.source === nodeId || e.target === nodeId) return sum + (e.data?.order ?? 1);
    return sum;
  }, 0);
}

function validateBonds(drawn: BondEdgeType[], expected: MolBond[]): boolean {
  if (drawn.length !== expected.length) return false;
  const key = (s: string, t: string) => [s, t].sort().join('|');
  const drawnMap = new Map<string, number>();
  for (const e of drawn) drawnMap.set(key(e.source, e.target), e.data?.order ?? 1);
  for (const b of expected) {
    if (drawnMap.get(key(b.source, b.target)) !== b.order) return false;
  }
  return true;
}

export type BondsOnlyCanvasHandle = {
  validate: () => boolean;
  reset: () => void;
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

    useEffect(() => {
      setEdges([]);
    }, [resetKey, setEdges]);

    useImperativeHandle(ref, () => ({
      validate: () => validateBonds(edges as BondEdgeType[], graph.bonds),
      reset: () => setEdges([]),
    }), [edges, graph.bonds, setEdges]);

    const isValidConnection: IsValidConnection = (connection) => {
      if (connection.source === connection.target) return false;
      const typedEdges = edges as BondEdgeType[];
      const typedNodes = nodes as AtomNodeType[];
      const srcUsed = usedBonds(connection.source, typedEdges);
      const tgtUsed = usedBonds(connection.target, typedEdges);
      const srcValence = ELEMENTS[typedNodes.find(n => n.id === connection.source)?.data.element ?? '']?.valence ?? Infinity;
      const tgtValence = ELEMENTS[typedNodes.find(n => n.id === connection.target)?.data.element ?? '']?.valence ?? Infinity;
      return srcUsed < srcValence && tgtUsed < tgtValence;
    };

    const onConnect: OnConnect = (connection) => {
      setEdges((eds) => addEdge<BondEdgeType>({ ...connection, type: 'bond', data: { order: 1 } }, eds));
    };

    const cycleEdgeOrder: OnEdgeClick = (_event, edge) => {
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

    const [hintBondIdx, setHintBondIdx] = useState<number | null>(null);

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <style>{`
          .lewis-atom-node:hover .react-flow__handle,
          .react-flow__node.selected .lewis-atom-node .react-flow__handle {
            opacity: 1 !important;
          }
          .react-flow__handle-connecting,
          .react-flow__handle-valid { opacity: 1 !important; background: #E2603F !important; border-color: white !important; }
          .react-flow__handle { background: transparent; }
        `}</style>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onEdgeClick={cycleEdgeOrder}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          nodesDraggable={false}
          style={{ width: '100%', height: '100%' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(26,46,59,0.1)" />
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
            <button
              onClick={() => {
                const nextIdx = hintBondIdx === null ? 0 : (hintBondIdx + 1) % graph.bonds.length;
                setHintBondIdx(nextIdx);
                setTimeout(() => setHintBondIdx(null), 1500);
              }}
              style={{
                padding: '5px 10px',
                border: 'none',
                borderRadius: 6,
                background: '#4A6275',
                color: 'white',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Flash hint bond
            </button>
          </div>
          {hintBondIdx !== null && graph.bonds[hintBondIdx] && (
            <HintBondOverlay
              bond={graph.bonds[hintBondIdx]}
              nodes={nodes as AtomNodeType[]}
            />
          )}
        </ReactFlow>

        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(26,46,59,0.12)',
          borderRadius: 8,
          padding: '10px 14px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.75rem',
          color: '#4A6275',
          zIndex: 10,
          lineHeight: 1.6,
        }}>
          <strong style={{ color: '#1A2E3B' }}>Tips</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 14 }}>
            <li>Hover an atom to reveal handles</li>
            <li>Drag a handle to another atom to bond</li>
            <li>Click a bond to toggle single/double</li>
          </ul>
          <div style={{ marginTop: 6, color: '#1A2E3B', fontWeight: 600 }}>
            {edges.length} / {graph.bonds.length} bonds drawn
          </div>
        </div>
      </div>
    );
  },
);

function HintBondOverlay({ bond, nodes }: { bond: MolBond; nodes: AtomNodeType[] }) {
  const src = nodes.find(n => n.id === bond.source);
  const tgt = nodes.find(n => n.id === bond.target);
  if (!src || !tgt) return null;
  const sx = src.position.x + ATOM_RADIUS;
  const sy = src.position.y + ATOM_RADIUS;
  const tx = tgt.position.x + ATOM_RADIUS;
  const ty = tgt.position.y + ATOM_RADIUS;
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20, width: '100%', height: '100%' }}>
      <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="#E2603F" strokeWidth={4} strokeDasharray="6 3" opacity={0.7} />
    </svg>
  );
}
