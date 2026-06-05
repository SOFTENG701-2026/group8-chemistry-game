type StatProps = {
  label: string;
  value: string | number;
  accent?: boolean;
};

export function Stat({ label, value, accent }: StatProps) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div
        style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '0.62rem',
          fontStyle: 'italic',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: accent ? 'var(--accent)' : 'var(--text)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
