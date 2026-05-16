import type { Problem } from '../types';
import { CARD_DEF } from '../data/cards';

type PromptCardProps = {
  problem: Problem;
  idx: number;
  hintLevel: number;
};

export function PromptCard({ problem, idx, hintLevel }: PromptCardProps) {
  return (
    <section
      style={{
        background: '#FBFAF4',
        border: '1.5px solid #1A2E3B',
        borderRadius: '4px',
        padding: '22px 26px',
        position: 'relative',
        boxShadow: '5px 5px 0 #1A2E3B',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '0.7rem',
          fontStyle: 'italic',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#A03E2E',
        }}
      >
        <span>specimen №{String(idx + 1).padStart(2, '0')}</span>
        <span style={{ flex: 1, borderTop: '1px dashed #C57B6E' }} />
        <span>{problem.correct.length} parts required</span>
      </div>

      <h2
        style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '2.1rem',
          fontWeight: 600,
          margin: '10px 0 4px',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
          color: '#1A2E3B',
        }}
      >
        {problem.name}
      </h2>
      <p
        style={{
          fontStyle: 'italic',
          fontFamily: '"Fraunces", Georgia, serif',
          color: '#4A6275',
          fontSize: '0.95rem',
          margin: '0 0 14px',
        }}
      >
        {problem.sub}
      </p>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1A2E3B',
          color: '#F5EFE1',
          padding: '6px 12px',
          borderRadius: '3px',
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 500,
          fontSize: '1.05rem',
        }}
      >
        <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>target ⇢</span>
        {problem.formula}
      </div>

      {hintLevel >= 1 && (
        <div
          className="pop-in"
          style={{
            marginTop: '14px',
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: '#A03E2E',
          }}
        >
          hint · begins with the{' '}
          <strong style={{ fontStyle: 'normal' }}>
            {CARD_DEF[problem.correct[0]].name}
          </strong>{' '}
          group
          {hintLevel >= 2 && (
            <>
              , ends with the{' '}
              <strong style={{ fontStyle: 'normal' }}>
                {CARD_DEF[problem.correct[problem.correct.length - 1]].name}
              </strong>
            </>
          )}
        </div>
      )}
    </section>
  );
}
