import { FORMULA_TO_NAME } from '../data/elements';
import { hillFormula, isConnected, allValencesSatisfied } from '../utils/moleculeUtils';
import type { AtomNodeType } from './AtomNode';
import type { BondEdgeType } from './BondEdge';

type Props = {
  nodes: AtomNodeType[];
  edges: BondEdgeType[];
};

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
