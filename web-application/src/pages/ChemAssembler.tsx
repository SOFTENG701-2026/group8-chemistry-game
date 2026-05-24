import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useChemAssembler } from '../features/chem-assembler/hooks/useChemAssembler';
import { Stat } from '../features/chem-assembler/components/Stat';
import { PromptCard } from '../features/chem-assembler/components/PromptCard';
import { BuildArea } from '../features/chem-assembler/components/BuildArea';
import { FeedbackRow } from '../features/chem-assembler/components/FeedbackRow';
import { ReagentTray } from '../features/chem-assembler/components/ReagentTray';
import { Controls } from '../features/chem-assembler/components/Controls';
import { Legend } from '../features/chem-assembler/components/Legend';
import { LewisCanvas } from '../features/lewis-editor/components/LewisCanvas';
import { PROBLEMS } from '../features/chem-assembler/data/problems';

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

function ChemAssemblerStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      @keyframes shakeX {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-5px); }
        80% { transform: translateX(5px); }
      }
      @keyframes popIn {
        0% { transform: scale(0.6); opacity: 0; }
        70% { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
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
      .shake { animation: shakeX 0.45s ease-in-out; }
      .pop-in { animation: popIn 0.3s ease-out; }
      button:focus-visible { outline: 2px solid #E2603F; outline-offset: 2px; }
    `}</style>
  );
}

export function ChemAssembler() {
  const [lewisMode, setLewisMode] = useState(false);
  const [lewisResetKey, setLewisResetKey] = useState(0);

  const {
    isSandbox, idx, problem, pool, built, feedback, streak, progress,
    shake, hintLevel, assembledFormula, assembledMoleculeName,
    moveToBuild, moveToPool,
    onDragStart, onDragOver, onDropBuild, onDropPool,
    check, next, prev, reset, giveHint,
  } = useChemAssembler();

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
      <ChemAssemblerStyles />
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
              {isSandbox ? 'free play' : 'an exercise in'}
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
          {!isSandbox && (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Stat label="streak" value={streak} accent />
              <Stat label="solved" value={`${progress}/${PROBLEMS.length}`} />
            </div>
          )}
        </header>

        {!isSandbox && problem && <PromptCard problem={problem} idx={idx} hintLevel={hintLevel} />}

        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {(['cards', 'lewis'] as const).map((m) => {
            const active = (m === 'lewis') === lewisMode;
            return (
              <button
                key={m}
                onClick={() => {
                  const togglingToLewis = m === 'lewis';
                  setLewisMode(togglingToLewis);
                  if (!isSandbox) {
                    if (togglingToLewis) reset();
                    else setLewisResetKey((k) => k + 1);
                  }
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

        {isSandbox ? (
          <>
            <div style={{ display: lewisMode ? 'block' : 'none', marginTop: 24, minHeight: 480 }}>
              <ReactFlowProvider>
                <LewisCanvas resetKey={lewisResetKey} />
              </ReactFlowProvider>
            </div>
            {!lewisMode && (
              <BuildArea
                built={built}
                feedback={feedback}
                shake={shake}
                assembledFormula={assembledFormula}
                onDragOver={onDragOver}
                onDrop={onDropBuild}
                onDragStart={onDragStart}
                onCardClick={moveToPool}
              />
            )}
          </>
        ) : lewisMode ? (
          <div style={{ marginTop: 24, minHeight: 480 }}>
            <ReactFlowProvider>
              <LewisCanvas resetKey={lewisResetKey} />
            </ReactFlowProvider>
          </div>
        ) : (
          <BuildArea
            built={built}
            feedback={feedback}
            shake={shake}
            assembledFormula={assembledFormula}
            onDragOver={onDragOver}
            onDrop={onDropBuild}
            onDragStart={onDragStart}
            onCardClick={moveToPool}
          />
        )}

        {!isSandbox && <FeedbackRow feedback={feedback} onNext={next} />}

        {!lewisMode && (
          <ReagentTray
            pool={pool}
            feedback={feedback}
            onDragOver={onDragOver}
            onDrop={onDropPool}
            onDragStart={onDragStart}
            onCardClick={moveToBuild}
          />
        )}

        {!lewisMode && (
          <Controls
            isSandbox={isSandbox}
            onCheck={check}
            onReset={reset}
            onHint={giveHint}
            onPrev={prev}
            onNext={next}
            builtCount={built.length}
            feedback={feedback}
            hintLevel={hintLevel}
          />
        )}

        {!lewisMode && <Legend />}
      </div>
    </div>
  );
}
