import { useState } from 'react';
import type { DragEvent } from 'react';
import type { CardInstance, DragSource } from '../types';
import { CARD_DEF, FAMILY } from '../data/cards';

type TileProps = {
  card: CardInstance;
  location: DragSource;
  onDragStart: (e: DragEvent<HTMLElement>, instanceId: string, source: DragSource) => void;
  onClick: (instanceId: string) => void;
  disabled: boolean;
};

export function Tile({ card, location, onDragStart, onClick, disabled }: TileProps) {
  const [hovered, setHovered] = useState(false);
  const def = CARD_DEF[card.key];
  const fam = FAMILY[def.family];

  return (
    <button
      type="button"
      draggable={!disabled}
      onDragStart={(e) => onDragStart(e, card.instanceId, location)}
      onClick={() => !disabled && onClick(card.instanceId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        background: fam.bg,
        border: `1.5px solid ${fam.border}`,
        borderRadius: '10px',
        padding: '10px 14px 8px',
        minWidth: '78px',
        boxShadow: `0 2px 0 ${fam.border}, 0 4px 10px rgba(26,46,59,0.06)`,
        cursor: disabled ? 'not-allowed' : 'grab',
        opacity: disabled ? 0.5 : 1,
        transform: hovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.15s ease-out, opacity 0.15s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: fam.dot,
        }}
      />
      <span
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: '1.15rem',
          fontWeight: 600,
          color: '#1A2E3B',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {def.display}
      </span>
      <span
        style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '0.62rem',
          fontStyle: 'italic',
          color: '#4A6275',
          marginTop: '4px',
          letterSpacing: '0.04em',
          textTransform: 'lowercase',
        }}
      >
        {def.name}
      </span>
    </button>
  );
}
