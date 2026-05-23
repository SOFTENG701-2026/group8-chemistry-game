import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useChemAssembler } from '../features/chem-assembler/hooks/useChemAssembler';
import { BuildArea } from '../features/chem-assembler/components/BuildArea';
import { ReagentTray } from '../features/chem-assembler/components/ReagentTray';
import { Legend } from '../features/chem-assembler/components/Legend';
import { LewisCanvas } from '../features/lewis-editor/components/LewisCanvas';

function MoleculeReadoutPanel({ moleculeName }: { moleculeName: string | null }) {
  const isKnown = moleculeName !== null;

  return (
    <section
      style={{
        marginTop: '24px',
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid rgba(26,46,59,0.14)',
        borderRadius: '10px',
        padding: '14px 18px',
        boxShadow: '0 1px 0 rgba(26,46,59,0.04)',
      }}
    >
      <div
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#4A6275',
          marginBottom: 4,
        }}
      >
        Current molecule
      </div>
      <div
        style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '1.35rem',
          fontWeight: isKnown ? 600 : 400,
          fontStyle: isKnown ? 'normal' : 'italic',
          color: isKnown ? '#1A2E3B' : '#8A9BA8',
          lineHeight: 1.2,
        }}
      >
        {moleculeName ?? 'Unknown'}
      </div>
    </section>
  );
}

function SandboxStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      .grid-bg::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(to right, rgba(26,46,59,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(26,46,59,0.05) 1px, transparent 1px);
        background-size: 28px 28px;
        pointer-events: none;
        z-index: 0;
      }
      button:focus-visible { outline: 2px solid #E2603F; outline-offset: 2px; }
    `}</style>
  );
}

export function ChemAssembler() {
  const [lewisMode, setLewisMode] = useState(false);
  const [lewisResetKey, setLewisResetKey] = useState(0);

  const {
    pool, built, assembledFormula, assembledMoleculeName,
    moveToBuild, moveToPool,
    onDragStart, onDragOver, onDropBuild, onDropPool,
    reset,
  } = useChemAssembler(null);

  return (
    <div
      style={{
        background: '#F5EFE1',
        minHeight: '100vh',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        color: '#1A2E3B',
        padding: '24px 16px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SandboxStyles />
      <div className="grid-bg" style={{ position: 'absolute', inset: 0 }} />

      <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingBottom: '20px',
            borderBottom: '1.5px solid #1A2E3B',
            marginBottom: '28px',
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
              free play
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
              Sandbox
            </h1>
          </div>
        </header>

        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {(['cards', 'lewis'] as const).map((m) => {
            const active = (m === 'lewis') === lewisMode;
            return (
              <button
                key={m}
                onClick={() => {
                  const togglingToLewis = m === 'lewis';
                  setLewisMode(togglingToLewis);
                  if (togglingToLewis) reset();
                  else setLewisResetKey((k) => k + 1);
                }}
                style={{
                  padding: '6px 16px',
                  border: '1.5px solid #1A2E3B',
                  borderRadius: 6,
                  background: active ? '#1A2E3B' : 'transparent',
                  color: active ? '#F5EFE1' : '#1A2E3B',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {m === 'cards' ? 'Cards' : 'Lewis Structure'}
              </button>
            );
          })}
        </div>

        {!lewisMode && <MoleculeReadoutPanel moleculeName={assembledMoleculeName} />}

        {lewisMode ? (
          <div style={{ marginTop: 24, height: 480 }}>
            <ReactFlowProvider>
              <LewisCanvas resetKey={lewisResetKey} />
            </ReactFlowProvider>
          </div>
        ) : (
          <BuildArea
            built={built}
            feedback={null}
            shake={false}
            assembledFormula={assembledFormula}
            onDragOver={onDragOver}
            onDrop={onDropBuild}
            onDragStart={onDragStart}
            onCardClick={moveToPool}
          />
        )}

        {!lewisMode && (
          <ReagentTray
            pool={pool}
            feedback={null}
            onDragOver={onDragOver}
            onDrop={onDropPool}
            onDragStart={onDragStart}
            onCardClick={moveToBuild}
          />
        )}

        {!lewisMode && <Legend />}
      </div>
    </div>
  );
}
