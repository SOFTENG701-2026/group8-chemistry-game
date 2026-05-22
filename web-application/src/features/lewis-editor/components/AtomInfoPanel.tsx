import { ELEMENTS } from '../data/elements';
import type { BondEdgeType } from './BondEdge';
import type { AtomNodeType } from './AtomNode';

type Props = {
  selectedNode: AtomNodeType | undefined;
  edges: BondEdgeType[];
};

export function AtomInfoPanel({ selectedNode, edges }: Props) {
  if (!selectedNode) {
    return (
      <div style={containerStyle}>
        <div style={labelStyle}>Atom</div>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', color: '#8A9BA8', fontSize: '0.9rem' }}>
          Select an atom
        </div>
      </div>
    );
  }

  const el = selectedNode.data.element;
  const info = ELEMENTS[el];
  const bondCount = edges.filter(
    (e) => e.source === selectedNode.id || e.target === selectedNode.id,
  ).reduce((sum, e) => sum + (e.data?.order ?? 1), 0);
  const valence = info?.valence ?? '?';
  const isSatisfied = typeof valence === 'number' && bondCount >= valence;

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>Atom</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: info?.bg ?? '#EFF3F6',
            border: `2px solid ${info?.border ?? '#A8BEC9'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: 700,
            fontSize: el.length > 1 ? '0.7rem' : '0.95rem',
            color: '#1A2E3B',
            flexShrink: 0,
          }}
        >
          {el}
        </div>
        <div>
          <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.1rem', color: '#1A2E3B' }}>
            {info?.name ?? el}
          </div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: '#4A6275' }}>
            #{info?.atomicNumber ?? '—'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Row label="Valence" value={String(valence)} />
        <Row
          label="Bonds used"
          value={`${bondCount} / ${valence}`}
          accent={isSatisfied ? '#3C7530' : bondCount > (valence as number) ? '#A03E2E' : undefined}
        />
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#4A6275' }}>{label}</span>
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: accent ?? '#1A2E3B',
        }}
      >
        {value}
      </span>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.72)',
  border: '1.5px solid rgba(26,46,59,0.14)',
  borderRadius: 10,
  padding: '14px 16px',
};

const labelStyle: React.CSSProperties = {
  fontFamily: '"DM Sans", system-ui, sans-serif',
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#4A6275',
  marginBottom: 10,
};
