import { FAMILY } from '../data/cards';

export function Legend() {
  return (
    <details
      style={{
        marginTop: '28px',
        fontFamily: '"Fraunces", Georgia, serif',
        fontSize: '0.85rem',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontStyle: 'italic',
          color: 'var(--muted)',
          letterSpacing: '0.04em',
        }}
      >
        colour key — functional group families
      </summary>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px',
          marginTop: '12px',
        }}
      >
        {Object.entries(FAMILY).map(([fam, c]) => (
          <div
            key={fam}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: '6px',
              fontStyle: 'normal',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.78rem',
              color: 'var(--text)',
              textTransform: 'lowercase',
              letterSpacing: '0.02em',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: c.dot,
                flexShrink: 0,
              }}
            />
            {fam}
          </div>
        ))}
      </div>
    </details>
  );
}
