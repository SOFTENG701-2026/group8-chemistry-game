import { ReactFlowProvider } from '@xyflow/react';
import { LewisCanvas } from '../features/lewis-editor/components/LewisCanvas';

export function LewisEditor() {
  return (
    <div
      style={{
        background: '#F5EFE1',
        minHeight: '100vh',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        color: '#1A2E3B',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .react-flow__edge-interaction { cursor: pointer; }
      `}</style>

      <div
        style={{
          flex: 1,
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
          padding: '0 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minHeight: 0,
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingBottom: '16px',
            borderBottom: '1.5px solid #1A2E3B',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '0.7rem',
                fontStyle: 'italic',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#4A6275',
              }}
            >
              visual · structural
            </div>
            <h1
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 700,
                fontSize: '2.3rem',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                margin: '2px 0 0',
                color: '#1A2E3B',
              }}
            >
              Lewis Editor
            </h1>
          </div>
        </header>

        {/* ReactFlowProvider must wrap any component using useReactFlow */}
        <ReactFlowProvider>
          <div style={{ flex: 1, minHeight: 520, display: 'flex' }}>
            <LewisCanvas />
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
