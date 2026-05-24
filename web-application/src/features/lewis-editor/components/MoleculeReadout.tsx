import { useEffect, useMemo, useState } from 'react';
import { FORMULA_TO_NAME } from '../data/elements';
import { hillFormula, isConnected, allValencesSatisfied } from '../utils/moleculeUtils';
import type { AtomNodeType } from './AtomNode';
import type { BondEdgeType } from './BondEdge';

type Props = {
  nodes: AtomNodeType[];
  edges: BondEdgeType[];
};

type MoleculeSummary = {
  formula: string;
  isEmpty: boolean;
  statusNote: string | null;
  name: string | null;
};

type MoleculeGraph = {
  nodes: AtomNodeType[];
  edges: BondEdgeType[];
};

function getSelectedMoleculeGraph(nodes: AtomNodeType[], edges: BondEdgeType[]): MoleculeGraph | null {
  const selectedIds = new Set(nodes.filter((node) => node.selected).map((node) => node.id));
  for (const edge of edges) {
    if (edge.selected) {
      selectedIds.add(edge.source);
      selectedIds.add(edge.target);
    }
  }
  if (selectedIds.size === 0) return null;

  const nodeIds = new Set(nodes.map((node) => node.id));
  const adjacency = new Map<string, Set<string>>();
  for (const node of nodes) adjacency.set(node.id, new Set());
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  const moleculeIds = new Set<string>();
  for (const id of selectedIds) {
    if (moleculeIds.has(id)) continue;
    const queue = [id];
    while (queue.length) {
      const current = queue.shift()!;
      if (moleculeIds.has(current)) continue;
      moleculeIds.add(current);
      for (const neighbour of adjacency.get(current) ?? []) {
        if (!moleculeIds.has(neighbour)) queue.push(neighbour);
      }
    }
  }

  const moleculeNodes = nodes.filter((node) => moleculeIds.has(node.id));
  const moleculeEdges = edges.filter(
    (edge) => moleculeIds.has(edge.source) && moleculeIds.has(edge.target),
  );

  return { nodes: moleculeNodes, edges: moleculeEdges };
}

function summarizeMolecule(nodes: AtomNodeType[], edges: BondEdgeType[]): MoleculeSummary {
  const formula = hillFormula(nodes);
  const isEmpty = nodes.length === 0;
  const connected = !isEmpty && isConnected(nodes, edges);
  const satisfied = !isEmpty && allValencesSatisfied(nodes, edges);
  const ready = connected && satisfied;
  const name = ready ? (FORMULA_TO_NAME[formula] ?? null) : null;

  let statusNote: string | null = null;
  if (!isEmpty && !connected) statusNote = 'Atoms not all connected';
  else if (!isEmpty && !satisfied) statusNote = 'Valences incomplete';

  return { formula, isEmpty, statusNote, name };
}

export function MoleculeReadout({ nodes, edges }: Props) {
  const selectedSummary = useMemo(() => {
    const selectedGraph = getSelectedMoleculeGraph(nodes, edges);
    return selectedGraph ? summarizeMolecule(selectedGraph.nodes, selectedGraph.edges) : null;
  }, [nodes, edges]);
  const [lastSummary, setLastSummary] = useState<MoleculeSummary | null>(null);

  useEffect(() => {
    if (selectedSummary) setLastSummary(selectedSummary);
  }, [selectedSummary]);

  useEffect(() => {
    if (nodes.length === 0) setLastSummary(null);
  }, [nodes.length]);

  const summary = selectedSummary ?? lastSummary ?? summarizeMolecule(nodes, edges);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid rgba(26,46,59,0.14)',
        borderRadius: 10,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#4A6275',
          marginBottom: 6,
        }}
      >
        Molecule
      </div>
      {summary.isEmpty ? (
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', color: '#8A9BA8', fontSize: '0.9rem' }}>
          Add atoms to begin
        </div>
      ) : (
        <>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1A2E3B',
              marginBottom: 2,
            }}
          >
            {summary.formula}
          </div>
          {summary.statusNote ? (
            <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', color: '#8A9BA8', fontSize: '0.85rem' }}>
              {summary.statusNote}
            </div>
          ) : (
            <div
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '0.95rem',
                fontWeight: summary.name ? 600 : 400,
                fontStyle: summary.name ? 'normal' : 'italic',
                color: summary.name ? '#1A2E3B' : '#8A9BA8',
              }}
            >
              {summary.name ?? 'Unknown'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
