import { useEffect, useMemo, useState } from 'react';
import { FORMULA_TO_NAME, ELEMENTS } from '../data/elements';
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

function hillFormula(nodes: AtomNodeType[]): string {
  if (nodes.length === 0) return '';
  const counts: Record<string, number> = {};
  for (const n of nodes) {
    const el = n.data.element;
    counts[el] = (counts[el] ?? 0) + 1;
  }
  const parts: string[] = [];
  if (counts['C']) parts.push(`C${counts['C'] > 1 ? counts['C'] : ''}`);
  if (counts['H']) parts.push(`H${counts['H'] > 1 ? counts['H'] : ''}`);
  for (const el of Object.keys(counts).sort()) {
    if (el !== 'C' && el !== 'H') parts.push(`${el}${counts[el] > 1 ? counts[el] : ''}`);
  }
  return parts.join('');
}

function isConnected(nodes: AtomNodeType[], edges: BondEdgeType[]): boolean {
  if (nodes.length === 0) return false;
  if (nodes.length === 1) return true;

  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n.id, new Set());
  for (const e of edges) {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  }

  const visited = new Set<string>();
  const queue = [nodes[0].id];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const neighbour of adj.get(id) ?? []) {
      if (!visited.has(neighbour)) queue.push(neighbour);
    }
  }
  return visited.size === nodes.length;
}

function allValencesSatisfied(nodes: AtomNodeType[], edges: BondEdgeType[]): boolean {
  for (const node of nodes) {
    const valence = ELEMENTS[node.data.element]?.valence;
    if (valence === undefined) continue;
    const used = edges.reduce((sum, e) => {
      if (e.source === node.id || e.target === node.id) return sum + (e.data?.order ?? 1);
      return sum;
    }, 0);
    if (used !== valence) return false;
  }
  return true;
}

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

  const summary = selectedSummary ?? lastSummary ?? summarizeMolecule([], []);

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
