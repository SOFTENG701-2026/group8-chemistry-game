import { IconCheck, IconX } from '@tabler/icons-react';
import type { Feedback, LessonErrorType } from '../types';

type FeedbackRowProps = {
  feedback: Feedback;
  onNext?: () => void;
  errorType?: LessonErrorType;
  drawnName?: string | null;
};

function getWrongMessage(errorType: LessonErrorType | undefined, drawnName?: string | null): string {
  switch (errorType) {
    case 'wrong_order':       return 'Right pieces, wrong order — try rearranging.';
    case 'wrong_length_low':  return 'You need more pieces.';
    case 'wrong_length_high': return 'Too many pieces — remove some.';
    case 'wrong_family':      return 'Wrong functional group — check the card families.';
    case 'wrong_card':        return 'One or more cards are incorrect.';
    case 'too_few_bonds':     return 'More bonds are needed.';
    case 'too_many_bonds':    return 'Too many bonds — remove some.';
    case 'wrong_bond_order':  return 'Check bond types — some should be double bonds.';
    case 'wrong_structure':   return 'Bond count is right but the connections are wrong.';
    case 'wrong_formula':
      return drawnName
        ? `You drew ${drawnName} — that's not the target molecule.`
        : 'Wrong molecule. Check the formula.';
    default: return 'Check the order or the functional groups.';
  }
}

export function FeedbackRow({ feedback, onNext, errorType, drawnName }: FeedbackRowProps) {
  if (!feedback) return null;

  const isRight = feedback === 'right';
  const statusLabel = isRight ? 'Correct' : 'Incorrect';
  const StatusIcon = isRight ? IconCheck : IconX;

  return (
    <div
      className="pop-in"
      role="status"
      aria-live="polite"
      style={{
        marginTop: '14px',
        padding: '12px 16px',
        borderRadius: '6px',
        background: isRight ? '#3C7530' : 'var(--danger)',
        color: 'var(--bg)',
        fontFamily: '"Fraunces", Georgia, serif',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span
          aria-label={statusLabel}
          title={statusLabel}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--bg)',
            color: isRight ? '#2F7558' : 'var(--danger)',
            display: 'inline-grid',
            placeItems: 'center',
            flex: '0 0 auto',
            boxShadow: '0 0 0 2px rgba(245,239,225,0.35)',
          }}
        >
          <StatusIcon size={20} stroke={3} aria-hidden="true" />
        </span>
        <div>
          <strong style={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {isRight ? 'Correctly assembled.' : 'Not quite.'}
          </strong>{' '}
          <span style={{ fontStyle: 'italic', opacity: 0.9 }}>
            {isRight
              ? 'Bonds satisfied. Onward.'
              : getWrongMessage(errorType, drawnName)}
          </span>
        </div>
      </div>
      {isRight && onNext && (
        <button
          onClick={onNext}
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
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
