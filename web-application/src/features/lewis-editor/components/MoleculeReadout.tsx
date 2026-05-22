import { FORMULA_TO_NAME, ELEMENTS } from '../data/elements';
import type { AtomNodeType } from './AtomNode';
import type { BondEdgeType } from './BondEdge';

type Props = {
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

export function MoleculeReadout({ nodes, edges }: Props) {
  const formula = hillFormula(nodes);
  const isEmpty = nodes.length === 0;

  const connected = !isEmpty && isConnected(nodes, edges);
  const satisfied = !isEmpty && allValencesSatisfied(nodes, edges);
  const ready = connected && satisfied;

  const name = ready ? (FORMULA_TO_NAME[formula] ?? null) : null;

  let statusNote: string | null = null;
  if (!isEmpty && !connected) statusNote = 'Atoms not all connected';
  else if (!isEmpty && !satisfied) statusNote = 'Valences incomplete';

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
      {isEmpty ? (
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
            {formula}
          </div>
          {statusNote ? (
            <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', color: '#8A9BA8', fontSize: '0.85rem' }}>
              {statusNote}
            </div>
          ) : (
            <div
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '0.95rem',
                fontWeight: name ? 600 : 400,
                fontStyle: name ? 'normal' : 'italic',
                color: name ? '#1A2E3B' : '#8A9BA8',
              }}
            >
              {name ?? 'Unknown'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
