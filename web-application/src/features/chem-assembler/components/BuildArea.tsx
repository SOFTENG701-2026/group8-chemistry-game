import type { DragEvent } from 'react';
import type { CardInstance, Feedback, DragSource } from '../types';
import { Tile } from './Tile';

type BuildAreaProps = {
  built: CardInstance[];
  feedback: Feedback;
  shake: boolean;
  assembledFormula: string;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onDragStart: (e: DragEvent<HTMLElement>, instanceId: string, source: DragSource) => void;
  onCardClick: (instanceId: string) => void;
};

export function BuildArea({
  built, feedback, shake, assembledFormula,
  onDragOver, onDrop, onDragStart, onCardClick,
}: BuildAreaProps) {
  const borderColor =
    feedback === 'right' ? '#3C7530' : feedback === 'wrong' ? '#A03E2E' : '#8A9BA8';
  const bgColor =
    feedback === 'right'
      ? 'rgba(60,117,48,0.10)'
      : feedback === 'wrong'
      ? 'rgba(160,62,46,0.08)'
      : 'rgba(26,46,59,0.03)';

  return (
    <section
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={shake ? 'shake' : ''}
      style={{
        marginTop: '24px',
        minHeight: '130px',
        background: bgColor,
        border: `2px dashed ${borderColor}`,
        borderRadius: '12px',
        padding: '18px',
        transition: 'background 0.25s, border-color 0.25s',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '0.7rem',
          fontStyle: 'italic',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#4A6275',
        }}
      >
        <span>assembly bench</span>
        {built.length > 0 && (
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              textTransform: 'none',
              letterSpacing: 0,
              fontStyle: 'normal',
              fontSize: '0.85rem',
              color: '#1A2E3B',
            }}
          >
            {assembledFormula}
          </span>
        )}
      </div>

      {built.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8A9BA8',
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            minHeight: '60px',
            textAlign: 'center',
            padding: '12px',
          }}
        >
          drag pieces here — or tap them — to build the molecule
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {built.map((card, i) => (
            <div
              key={card.instanceId}
              className="pop-in"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <Tile
                card={card}
                location="build"
                onDragStart={onDragStart}
                onClick={onCardClick}
                disabled={feedback === 'right'}
              />
              {i < built.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    margin: '0 -2px',
                    color: '#4A6275',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.3rem',
                    fontWeight: 300,
                  }}
                >
                  ·
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
