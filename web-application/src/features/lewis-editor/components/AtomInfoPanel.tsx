import { useEffect, useState } from 'react';
import { ELEMENTS } from '../data/elements';
import type { BondEdgeType } from './BondEdge';
import type { AtomNodeType } from './AtomNode';

type Props = {
  selectedNodes: AtomNodeType[];
  edges: BondEdgeType[];
  onPreviewAtomChange?: (atomId: string | null) => void;
};

export function AtomInfoPanel({ selectedNodes, edges, onPreviewAtomChange }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedNode = selectedNodes[selectedIndex] ?? selectedNodes[0];
  const hasMultiple = selectedNodes.length > 1;

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(selectedNodes.length - 1, 0)));
  }, [selectedNodes.length]);

  useEffect(() => {
    onPreviewAtomChange?.(selectedNode?.id ?? null);
  }, [onPreviewAtomChange, selectedNode?.id]);

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
      <div style={headerStyle}>
        <div style={labelStyle}>Atom</div>
        <div style={{ ...cycleControlsStyle, visibility: hasMultiple ? 'visible' : 'hidden' }}>
          <CycleButton
            label="Previous atom"
            disabled={!hasMultiple}
            onClick={() => setSelectedIndex((i) => (i - 1 + selectedNodes.length) % selectedNodes.length)}
          >
            &lsaquo;
          </CycleButton>
          <span style={cycleCountStyle}>
            {selectedIndex + 1}/{selectedNodes.length}
          </span>
          <CycleButton
            label="Next atom"
            disabled={!hasMultiple}
            onClick={() => setSelectedIndex((i) => (i + 1) % selectedNodes.length)}
          >
            &rsaquo;
          </CycleButton>
        </div>
      </div>
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

function CycleButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 22,
        height: 22,
        border: '1px solid rgba(26,46,59,0.22)',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.7)',
        color: '#1A2E3B',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: '0.9rem',
        fontWeight: 700,
        lineHeight: 1,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {children}
    </button>
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
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8,
  height: 24,
  marginBottom: 10,
};

const cycleControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: 90,
  height: 24,
  flexShrink: 0,
};

const cycleCountStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.68rem',
  color: '#4A6275',
  width: 34,
  textAlign: 'center',
};
