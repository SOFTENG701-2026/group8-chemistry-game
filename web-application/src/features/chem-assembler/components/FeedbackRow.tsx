import type { Feedback } from '../types';

type FeedbackRowProps = {
  feedback: Feedback;
  onNext?: () => void;
};

export function FeedbackRow({ feedback, onNext }: FeedbackRowProps) {
  if (!feedback) return null;

  return (
    <div
      className="pop-in"
      style={{
        marginTop: '14px',
        padding: '12px 16px',
        borderRadius: '6px',
        background: feedback === 'right' ? '#3C7530' : '#A03E2E',
        color: '#F5EFE1',
        fontFamily: '"Fraunces", Georgia, serif',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <strong style={{ fontWeight: 700, fontSize: '1.05rem' }}>
          {feedback === 'right' ? 'Correctly assembled.' : 'Not quite.'}
        </strong>{' '}
        <span style={{ fontStyle: 'italic', opacity: 0.9 }}>
          {feedback === 'right'
            ? 'Bonds satisfied. Onward.'
            : 'Check the order or the functional groups.'}
        </span>
      </div>
      {feedback === 'right' && onNext && (
        <button
          onClick={onNext}
          style={{
            background: '#F5EFE1',
            color: '#1A2E3B',
            border: 'none',
            padding: '8px 18px',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderRadius: '3px',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          next specimen →
        </button>
      )}
    </div>
  );
}
