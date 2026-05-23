import { useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { ReactFlowProvider } from '@xyflow/react';
import { PROBLEMS } from '../features/chem-assembler/data/problems';
import { useChemAssembler } from '../features/chem-assembler/hooks/useChemAssembler';
import { BuildArea } from '../features/chem-assembler/components/BuildArea';
import { ReagentTray } from '../features/chem-assembler/components/ReagentTray';
import { FeedbackRow } from '../features/chem-assembler/components/FeedbackRow';
import { Legend } from '../features/chem-assembler/components/Legend';
import { buildMolecularGraph } from '../features/chem-assembler/data/molecularGraph';
import { LewisCanvas } from '../features/lewis-editor/components/LewisCanvas';
import { BondsOnlyCanvas, type BondsOnlyCanvasHandle } from '../features/lewis-editor/components/BondsOnlyCanvas';
import { recordSuccessfulBuild } from '../features/chem-assembler/api/progress';
import type { Feedback } from '../features/chem-assembler/types';

type Level = 1 | 2 | 3;

const LEVEL_LABELS: Record<Level, string> = {
  1: 'Drag & drop reagents',
  2: 'Place the bonds',
  3: 'Draw from scratch',
};

// ── Shared styles ──────────────────────────────────────────────────────────────

function LessonStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      @keyframes shakeX {
        0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}
      }
      @keyframes popIn {
        0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}
      }
      .lesson-grid-bg::before {
        content:"";position:absolute;inset:0;
        background-image:linear-gradient(to right,rgba(26,46,59,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(26,46,59,0.05) 1px,transparent 1px);
        background-size:28px 28px;pointer-events:none;z-index:0;
      }
      .shake{animation:shakeX 0.45s ease-in-out}
      .pop-in{animation:popIn 0.3s ease-out}
      button:focus-visible{outline:2px solid #E2603F;outline-offset:2px}
    `}</style>
  );
}

// ── Level Picker ───────────────────────────────────────────────────────────────

function LevelPicker({ molecule, problem }: { molecule: string; problem: (typeof PROBLEMS)[0] }) {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <Link
        to="/lessons"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: '0.85rem',
          color: '#4A6275', textDecoration: 'none', marginBottom: 32,
        }}
      >
        ← Back to lessons
      </Link>

      <div style={{ color: '#E2603F', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 6 }}>
        Specimen
      </div>
      <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '2.5rem', fontWeight: 700, margin: '0 0 6px', color: '#1A2E3B' }}>
        {molecule}
      </h1>
      <p style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', color: '#4A6275', fontSize: '1rem', margin: '0 0 48px' }}>
        {problem.sub}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {([1, 2, 3] as Level[]).map((lvl) => (
          <div
            key={lvl}
            style={{
              background: 'white', border: '1.5px solid #E5E1D8', borderRadius: 10,
              padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A6275', marginBottom: 4 }}>
                Level {lvl}
              </div>
              <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.1rem', fontWeight: 600, color: '#1A2E3B' }}>
                {LEVEL_LABELS[lvl]}
              </div>
            </div>
            <button
              onClick={() => navigate(`/lesson?molecule=${encodeURIComponent(molecule)}&level=${lvl}`)}
              style={{
                background: '#1A2E3B', color: '#F5EFE1', border: 'none',
                padding: '10px 20px', borderRadius: 6, fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                boxShadow: '3px 3px 0 #E2603F',
              }}
            >
              Start →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared prompt (name + sub, no formula) ─────────────────────────────────────

function LessonPrompt({
  problem,
  hintLevel,
  level,
  bondCount,
}: {
  problem: (typeof PROBLEMS)[0];
  hintLevel: number;
  level: Level;
  bondCount?: number;
}) {
  return (
    <section
      style={{
        background: '#FBFAF4', border: '1.5px solid #1A2E3B', borderRadius: 4,
        padding: '18px 22px', boxShadow: '5px 5px 0 #1A2E3B', marginBottom: 20,
      }}
    >
      <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '2rem', fontWeight: 600, margin: '0 0 4px', color: '#1A2E3B' }}>
        {problem.name}
      </h2>
      <p style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', color: '#4A6275', fontSize: '0.95rem', margin: 0 }}>
        {problem.sub}
      </p>
      {hintLevel >= 1 && (
        <div className="pop-in" style={{ marginTop: 12, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '1rem', color: '#1A2E3B', background: 'rgba(26,46,59,0.06)', display: 'inline-block', padding: '4px 10px', borderRadius: 4 }}>
          {problem.formula}
        </div>
      )}
      {hintLevel >= 2 && (
        <div className="pop-in" style={{ marginTop: 8, fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: '0.85rem', fontStyle: 'italic', color: '#A03E2E' }}>
          {level === 1 && `${problem.correct.length} cards needed`}
          {level === 2 && `${bondCount ?? '?'} bonds needed`}
          {level === 3 && `Atoms: ${problem.formula}`}
        </div>
      )}
    </section>
  );
}

// ── Controls footer ────────────────────────────────────────────────────────────

function LessonControls({
  onCheck, onReset, onHint, onNextLevel,
  checkDisabled, hintDisabled, feedback, isLastLevel,
}: {
  onCheck: () => void;
  onReset: () => void;
  onHint: () => void;
  onNextLevel: () => void;
  checkDisabled: boolean;
  hintDisabled: boolean;
  feedback: Feedback;
  isLastLevel: boolean;
}) {
  const ghost: React.CSSProperties = {
    background: 'transparent', color: '#1A2E3B', border: '1.5px solid #1A2E3B',
    padding: '10px 18px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500,
    fontSize: '0.88rem', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.02em',
  };

  return (
    <footer style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      {feedback !== 'right' && (
        <button
          onClick={onCheck}
          disabled={checkDisabled}
          style={{
            background: '#1A2E3B', color: '#F5EFE1', border: 'none', padding: '12px 24px',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.95rem',
            borderRadius: 4, cursor: checkDisabled ? 'not-allowed' : 'pointer',
            opacity: checkDisabled ? 0.4 : 1, letterSpacing: '0.02em',
            boxShadow: '3px 3px 0 #E2603F',
          }}
        >
          check
        </button>
      )}
      {feedback === 'right' && (
        <button
          onClick={onNextLevel}
          style={{
            background: '#3C8D6A', color: 'white', border: 'none', padding: '12px 24px',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.95rem',
            borderRadius: 4, cursor: 'pointer', letterSpacing: '0.02em',
            boxShadow: '3px 3px 0 #1A2E3B',
          }}
        >
          {isLastLevel ? 'lesson complete ✓' : 'next level →'}
        </button>
      )}
      <button onClick={onReset} style={ghost}>reset</button>
      <button onClick={onHint} disabled={hintDisabled} style={{ ...ghost, opacity: hintDisabled ? 0.4 : 1 }}>
        hint
      </button>
    </footer>
  );
}

// ── Level 1: Cards ─────────────────────────────────────────────────────────────

function Level1Exercise({ problem, level, onCorrect, onNextLevel }: { problem: (typeof PROBLEMS)[0]; level: Level; onCorrect: () => void; onNextLevel: () => void }) {
  const {
    pool, built, feedback, shake, hintLevel,
    assembledFormula, moveToBuild, moveToPool,
    onDragStart, onDragOver, onDropBuild, onDropPool,
    check, reset, giveHint,
  } = useChemAssembler(problem.name);

  const [localFeedback, setLocalFeedback] = useState<Feedback>(null);

  function handleCheck() {
    const ok = check(level);
    setLocalFeedback(ok ? 'right' : 'wrong');
    if (ok) onCorrect();
  }

  const fb = (feedback ?? localFeedback) as Feedback;

  return (
    <>
      <LessonPrompt problem={problem} hintLevel={hintLevel} level={level} />
      <BuildArea
        built={built}
        feedback={fb}
        shake={shake}
        assembledFormula={assembledFormula}
        onDragOver={onDragOver}
        onDrop={onDropBuild}
        onDragStart={onDragStart}
        onCardClick={moveToPool}
      />
      <FeedbackRow feedback={fb} />
      <ReagentTray
        pool={pool}
        feedback={fb}
        onDragOver={onDragOver}
        onDrop={onDropPool}
        onDragStart={onDragStart}
        onCardClick={moveToBuild}
      />
      <LessonControls
        onCheck={handleCheck}
        onReset={reset}
        onHint={giveHint}
        onNextLevel={onNextLevel}
        checkDisabled={built.length === 0}
        hintDisabled={hintLevel >= 3}
        feedback={fb}
        isLastLevel={level === 3}
      />
      <Legend />
    </>
  );
}

// ── Level 2: Bonds only ────────────────────────────────────────────────────────

function Level2Exercise({ problem, level, onCorrect, onNextLevel }: { problem: (typeof PROBLEMS)[0]; level: Level; onCorrect: () => void; onNextLevel: () => void }) {
  const canvasRef = useRef<BondsOnlyCanvasHandle>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shake, setShake] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const graph = buildMolecularGraph(problem.correct);

  function handleCheck() {
    if (!canvasRef.current) return;
    const ok = canvasRef.current.validate();
    setFeedback(ok ? 'right' : 'wrong');
    if (ok) {
      void recordSuccessfulBuild(problem.name, level).catch(console.error);
      onCorrect();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function handleReset() {
    canvasRef.current?.reset();
    setFeedback(null);
    setShake(false);
    setResetKey(k => k + 1);
  }

  return (
    <>
      <LessonPrompt problem={problem} hintLevel={hintLevel} level={level} bondCount={graph.bonds.length} />
      <div className={shake ? 'shake' : ''} style={{ height: 480, borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(26,46,59,0.14)', background: '#FDFAF5' }}>
        <ReactFlowProvider>
          <BondsOnlyCanvas ref={canvasRef} graph={graph} resetKey={resetKey} />
        </ReactFlowProvider>
      </div>
      <FeedbackRow feedback={feedback} />
      <LessonControls
        onCheck={handleCheck}
        onReset={handleReset}
        onHint={() => {
          const next = hintLevel + 1;
          setHintLevel(Math.min(next, 3));
          if (next >= 3) canvasRef.current?.flashNextHint();
        }}
        onNextLevel={onNextLevel}
        checkDisabled={false}
        hintDisabled={hintLevel >= 3}
        feedback={feedback}
        isLastLevel={level === 3}
      />
    </>
  );
}

// ── Level 3: Free Lewis ────────────────────────────────────────────────────────

function Level3Exercise({ problem, level, onCorrect, onNextLevel }: { problem: (typeof PROBLEMS)[0]; level: Level; onCorrect: () => void; onNextLevel: () => void }) {
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shake, setShake] = useState(false);
  const [drawnName, setDrawnName] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  function handleCheck() {
    const ok = drawnName === problem.name;
    setFeedback(ok ? 'right' : 'wrong');
    if (ok) {
      void recordSuccessfulBuild(problem.name, level).catch(console.error);
      onCorrect();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function handleReset() {
    setResetKey(k => k + 1);
    setFeedback(null);
    setShake(false);
    setDrawnName(null);
  }

  return (
    <>
      <LessonPrompt problem={problem} hintLevel={hintLevel} level={level} />
      <div className={shake ? 'shake' : ''} style={{ height: 480, marginTop: 16, position: 'relative' }}>
        <ReactFlowProvider>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            <LewisCanvas resetKey={resetKey} onMoleculeChange={setDrawnName} />
          </div>
        </ReactFlowProvider>
      </div>
      <FeedbackRow feedback={feedback} />
      <LessonControls
        onCheck={handleCheck}
        onReset={handleReset}
        onHint={() => setHintLevel(h => Math.min(h + 1, 3))}
        onNextLevel={onNextLevel}
        checkDisabled={drawnName === null}
        hintDisabled={hintLevel >= 3}
        feedback={feedback}
        isLastLevel={level === 3}
      />
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function LessonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const moleculeName = searchParams.get('molecule') ?? '';
  const levelParam = Number(searchParams.get('level'));
  const activeLevel: Level | null = (levelParam === 1 || levelParam === 2 || levelParam === 3) ? levelParam : null;

  const problem = PROBLEMS.find(p => p.name === moleculeName);

  function goToLevel(lvl: Level) {
    navigate(`/lesson?molecule=${encodeURIComponent(moleculeName)}&level=${lvl}`);
  }

  function handleNextLevel() {
    if (!activeLevel) return;
    if (activeLevel < 3) goToLevel((activeLevel + 1) as Level);
    // level 3 complete — stay on page (feedback already shown)
  }

  if (!problem) {
    return (
      <div style={{ padding: 40, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        <p>Molecule not found. <Link to="/lessons">Back to lessons</Link></p>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5EFE1', minHeight: '100vh', color: '#1A2E3B', padding: '24px 16px 60px', position: 'relative', overflow: 'hidden' }}>
      <LessonStyles />
      <div className="lesson-grid-bg" style={{ position: 'absolute', inset: 0 }} />

      <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {!activeLevel ? (
          <LevelPicker molecule={moleculeName} problem={problem} />
        ) : (
          <>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, borderBottom: '1.5px solid #1A2E3B', marginBottom: 28 }}>
              <div>
                <Link
                  to={`/lesson?molecule=${encodeURIComponent(moleculeName)}`}
                  style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '0.7rem', fontStyle: 'italic', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A6275', textDecoration: 'none' }}
                >
                  ← {moleculeName}
                </Link>
                <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '2.3rem', lineHeight: 1, letterSpacing: '-0.02em', margin: '2px 0 0', color: '#1A2E3B' }}>
                  Level {activeLevel}
                </h1>
              </div>

              {/* Level tabs */}
              <div style={{ display: 'flex', gap: 6 }}>
                {([1, 2, 3] as Level[]).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => goToLevel(lvl)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '1.5px solid #1A2E3B',
                      background: lvl === activeLevel ? '#1A2E3B' : 'transparent',
                      color: lvl === activeLevel ? '#F5EFE1' : '#1A2E3B',
                      fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                      fontSize: '0.85rem', cursor: 'pointer',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </header>

            {/* Exercise */}
            {activeLevel === 1 && (
              <Level1Exercise key={`${moleculeName}-1`} problem={problem} level={1} onCorrect={() => {}} onNextLevel={handleNextLevel} />
            )}
            {activeLevel === 2 && (
              <Level2Exercise key={`${moleculeName}-2`} problem={problem} level={2} onCorrect={() => {}} onNextLevel={handleNextLevel} />
            )}
            {activeLevel === 3 && (
              <Level3Exercise key={`${moleculeName}-3`} problem={problem} level={3} onCorrect={() => {}} onNextLevel={handleNextLevel} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
