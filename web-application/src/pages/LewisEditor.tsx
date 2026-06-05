import { ReactFlowProvider } from '@xyflow/react';
import { LewisCanvas } from '../features/lewis-editor/components/LewisCanvas';

export function LewisEditor() {
  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
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
            borderBottom: '1.5px solid var(--text)',
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
                color: 'var(--muted)',
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
                color: 'var(--text)',
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
