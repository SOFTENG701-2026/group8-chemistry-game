import type { Feedback } from '../types';

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#1A2E3B',
  border: '1.5px solid #1A2E3B',
  padding: '10px 18px',
  fontFamily: '"DM Sans", sans-serif',
  fontWeight: 500,
  fontSize: '0.88rem',
  borderRadius: '4px',
  cursor: 'pointer',
  letterSpacing: '0.02em',
};

type ControlsProps = {
  onCheck: () => void;
  onReset: () => void;
  onHint: () => void;
  onPrev: () => void;
  onNext: () => void;
  builtCount: number;
  feedback: Feedback;
  hintLevel: number;
};

export function Controls({
  onCheck, onReset, onHint, onPrev, onNext,
  builtCount, feedback, hintLevel,
}: ControlsProps) {
  const checkDisabled = builtCount === 0 || feedback === 'right';
  const hintDisabled = hintLevel >= 2 || feedback === 'right';

  return (
    <footer
      style={{
        marginTop: '24px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <button
        onClick={onCheck}
        disabled={checkDisabled}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(2px,2px)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = '')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
        style={{
          background: '#1A2E3B',
          color: '#F5EFE1',
          border: 'none',
          padding: '12px 24px',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          fontSize: '0.95rem',
          borderRadius: '4px',
          cursor: checkDisabled ? 'not-allowed' : 'pointer',
          opacity: checkDisabled ? 0.4 : 1,
          letterSpacing: '0.02em',
          transition: 'transform 0.15s',
          boxShadow: '3px 3px 0 #E2603F',
        }}
      >
        check assembly
      </button>

      <button onClick={onReset} style={ghostBtn}>reset</button>

      <button
        onClick={onHint}
        disabled={hintDisabled}
        style={{ ...ghostBtn, opacity: hintDisabled ? 0.4 : 1 }}
      >
        {hintLevel === 0 ? 'hint' : hintLevel === 1 ? 'another hint' : 'out of hints'}
      </button>

      <div style={{ flex: 1 }} />

      <button onClick={onPrev} style={ghostBtn} aria-label="previous">←</button>
      <button onClick={onNext} style={ghostBtn} aria-label="next">skip →</button>
    </footer>
  );
}
