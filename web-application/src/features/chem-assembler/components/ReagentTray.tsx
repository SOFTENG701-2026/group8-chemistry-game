import type { DragEvent } from 'react';
import type { CardInstance, Feedback, DragSource } from '../types';
import { Tile } from './Tile';

type ReagentTrayProps = {
  pool: CardInstance[];
  feedback: Feedback;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onDragStart: (e: DragEvent<HTMLElement>, instanceId: string, source: DragSource) => void;
  onCardClick: (instanceId: string) => void;
};

export function ReagentTray({
  pool, feedback, onDragOver, onDrop, onDragStart, onCardClick,
}: ReagentTrayProps) {
  return (
    <section onDragOver={onDragOver} onDrop={onDrop} style={{ marginTop: '28px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '0.7rem',
            fontStyle: 'italic',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          reagent tray
        </div>
        <div
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '0.75rem',
            fontStyle: 'italic',
            color: 'var(--muted-2)',
          }}
        >
          {pool.length} {pool.length === 1 ? 'piece' : 'pieces'} available
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          minHeight: '90px',
          padding: '16px',
          background: 'var(--ink-soft)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: '10px',
        }}
      >
        {pool.length === 0 ? (
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              color: 'var(--muted-2)',
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              alignSelf: 'center',
            }}
          >
            tray empty
          </div>
        ) : (
          pool.map((card) => (
            <Tile
              key={card.instanceId}
              card={card}
              location="pool"
              onDragStart={onDragStart}
              onClick={onCardClick}
              disabled={feedback === 'right'}
            />
          ))
        )}
      </div>
    </section>
  );
}
