import { ELEMENTS, PALETTE_ELEMENTS } from '../data/elements';

export function AtomPalette() {
  function onDragStart(event: React.DragEvent<HTMLDivElement>, element: string) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.dataTransfer.setData('application/lewis-atom', element);
    event.dataTransfer.setData(
      'application/lewis-atom-offset',
      JSON.stringify({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }),
    );
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      style={{
        width: 96,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 8px',
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid rgba(26,46,59,0.14)',
        borderRadius: 12,
        alignSelf: 'flex-start',
        maxHeight: '100%',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4A6275',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        Atoms
      </div>
      {PALETTE_ELEMENTS.map((el) => {
        const info = ELEMENTS[el];
        return (
          <div
            key={el}
            draggable
            onDragStart={(e) => onDragStart(e, el)}
            title={`${info.name} (valence ${info.valence})`}
            style={{
              width: 44,
              height: 44,
              margin: '0 auto',
              borderRadius: '50%',
              backgroundColor: info.bg,
              border: `2px solid ${info.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: el.length > 1 ? '0.72rem' : '1rem',
              color: '#1A2E3B',
              cursor: 'grab',
              userSelect: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          >
            {el}
          </div>
        );
      })}
    </div>
  );
}
