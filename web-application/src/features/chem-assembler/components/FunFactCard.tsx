import { useState } from 'react';
import { FUN_FACTS } from '../data/funFacts';

const LEVEL_HEADERS: Record<number, string> = {
  1: 'Did you know?',
  2: 'Chemistry corner',
  3: 'History note',
};

export function FunFactCard({ moleculeName, level = 1 }: { moleculeName: string; level?: number }) {
  const [open, setOpen] = useState(false);
  const facts = FUN_FACTS[moleculeName];
  if (!facts) return null;

  const lvl = (level === 1 || level === 2 || level === 3 ? level : 1) as 1 | 2 | 3;
  const fact = facts[lvl];
  const header = LEVEL_HEADERS[lvl];

  return (
    <section
      className="pop-in"
      style={{
        marginTop: 16,
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid rgba(26,46,59,0.14)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(26,46,59,0.04)',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#E2603F',
        }}
      >
        <span>{header}</span>
        <span
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.7rem',
            color: '#4A6275',
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: '0 18px 16px',
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: '#1A2E3B',
          }}
        >
          {fact}
        </div>
      )}
    </section>
  );
}
