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
          color: '#4A6275',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: accent ? '#E2603F' : '#1A2E3B',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
