import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { lessonGroupData } from '../features/chem-assembler/data/lessonLibrary';
import { useChemAssembler } from '../features/chem-assembler/hooks/useChemAssembler';
import { BuildArea } from '../features/chem-assembler/components/BuildArea';
import { ReagentTray } from '../features/chem-assembler/components/ReagentTray';
import { FeedbackRow } from '../features/chem-assembler/components/FeedbackRow';
import { recordDiagnostic } from '../features/chem-assembler/api/progress';
import type { Feedback } from '../features/chem-assembler/types';

type Group = 1 | 2 | 3;

// One representative molecule per lesson group, in increasing difficulty.
// Each name exists in PROBLEMS, so it drives useChemAssembler directly.
const DIAGNOSTIC: { name: string; group: Group }[] = [
  { name: 'Methane', group: 1 },
  { name: 'Ethanoic Acid', group: 2 },
  { name: 'Methyl ethanoate', group: 3 },
];

function groupTitle(group: Group): string {
  return lessonGroupData.find(g => g.groupId === group)?.title ?? `Group ${group}`;
}

// ── Shared styles (animations + grid background) ────────────────────────────────

function OnboardingStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      @keyframes shakeX {
        0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}
      }
      @keyframes popIn {
        0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}
      }
      .onboarding-grid-bg::before {
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

const skipLinkStyle: React.CSSProperties = {
  fontFamily: '"DM Sans", system-ui, sans-serif',
  fontSize: '0.85rem',
  color: '#4A6275',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const primaryBtn: React.CSSProperties = {
  background: '#1A2E3B', color: '#F5EFE1', border: 'none', padding: '12px 24px',
  fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.95rem',
  borderRadius: 4, cursor: 'pointer', letterSpacing: '0.02em',
  boxShadow: '3px 3px 0 #E2603F',
};

const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: '#1A2E3B', border: '1.5px solid #1A2E3B',
  padding: '10px 18px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500,
  fontSize: '0.88rem', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.02em',
};

// ── One diagnostic build task (reuses the Level 1 card assembler) ────────────────

function DiagnosticTask({
  moleculeName,
  step,
  total,
  onSolved,
  onSkip,
}: {
  moleculeName: string;
  step: number;
  total: number;
  onSolved: () => void;
  onSkip: () => void;
}) {
  const {
    pool, built, shake,
    assembledFormula, moveToBuild, moveToPool,
    onDragStart, onDragOver, onDropBuild, onDropPool,
    check, reset,
  } = useChemAssembler(moleculeName);

  const [feedback, setFeedback] = useState<Feedback>(null);

  function handleCheck() {
    const ok = check(1);
    setFeedback(ok ? 'right' : 'wrong');
    if (ok) {
      // Brief pause so the learner sees the success state before advancing.
      setTimeout(onSolved, 650);
    }
  }

  function handleReset() {
    reset();
    setFeedback(null);
  }

  const solved = feedback === 'right';

  return (
    <>
      <div style={{ color: '#E2603F', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 6 }}>
        Task {step + 1} of {total}
      </div>
      <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: '0 0 4px', color: '#1A2E3B' }}>
        Build {moleculeName}
      </h1>
      <p style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', color: '#4A6275', fontSize: '0.95rem', margin: '0 0 8px' }}>
        Drag the right pieces into the bench. No score — just showing us what you know.
      </p>

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
      <FeedbackRow feedback={feedback} />
      <ReagentTray
        pool={pool}
        feedback={feedback}
        onDragOver={onDragOver}
        onDrop={onDropPool}
        onDragStart={onDragStart}
        onCardClick={moveToBuild}
      />

      <footer style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleCheck} disabled={built.length === 0 || solved} style={{ ...primaryBtn, opacity: built.length === 0 || solved ? 0.4 : 1, cursor: built.length === 0 || solved ? 'not-allowed' : 'pointer' }}>
          check
        </button>
        <button onClick={handleReset} disabled={solved} style={{ ...ghostBtn, opacity: solved ? 0.4 : 1 }}>reset</button>
        <button onClick={onSkip} disabled={solved} style={{ ...skipLinkStyle, marginLeft: 'auto', opacity: solved ? 0.4 : 1 }}>
          Can't get this one? Skip ahead →
        </button>
      </footer>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'task' | 'result';

export function Onboarding() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  // The hardest group the learner has built correctly so far (default: Basics).
  const [recommendedGroup, setRecommendedGroup] = useState<Group>(1);
  const [saving, setSaving] = useState(false);

  // Move to the next task, or to the result once the last task is reached.
  function advance() {
    if (step < DIAGNOSTIC.length - 1) {
      setStep(step + 1);
    } else {
      setPhase('result');
    }
  }

  function handleSolved() {
    setRecommendedGroup(DIAGNOSTIC[step].group);
    advance();
  }

  function handleSkipTask() {
    // Skip without crediting this group — the recommendation stays at the
    // hardest task they actually solved.
    advance();
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await recordDiagnostic(recommendedGroup);
    } catch (err) {
      console.error(err);
    }
    navigate('/lessons');
  }

  return (
    <div style={{ background: '#F5EFE1', minHeight: '100vh', color: '#1A2E3B', padding: '24px 16px 60px', position: 'relative', overflow: 'hidden' }}>
      <OnboardingStyles />
      <div className="onboarding-grid-bg" style={{ position: 'absolute', inset: 0 }} />

      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {phase === 'intro' && (
          <section style={{ paddingTop: 32 }}>
            <div style={{ color: '#E2603F', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 8 }}>
              Find your level
            </div>
            <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '2.6rem', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.05, color: '#1A2E3B' }}>
              Let's see what you already know.
            </h1>
            <p style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: '#4A6275', fontSize: '1rem', lineHeight: 1.6, maxWidth: 480, marginBottom: 32 }}>
              Build a few molecules from cards — they get harder as you go. There's no score and nothing to fail. We'll use what you build to point you to the right starting lessons.
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPhase('task')} style={primaryBtn}>Start →</button>
              <Link to="/lessons" style={{ ...skipLinkStyle, textDecoration: 'none' }}>
                Skip — let me explore on my own
              </Link>
            </div>
          </section>
        )}

        {phase === 'task' && (
          <DiagnosticTask
            key={DIAGNOSTIC[step].name}
            moleculeName={DIAGNOSTIC[step].name}
            step={step}
            total={DIAGNOSTIC.length}
            onSolved={handleSolved}
            onSkip={handleSkipTask}
          />
        )}

        {phase === 'result' && (
          <section style={{ paddingTop: 32 }}>
            <div style={{ color: '#E2603F', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 8 }}>
              Your starting point
            </div>
            <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.1, color: '#1A2E3B' }}>
              You're ready for {groupTitle(recommendedGroup)}.
            </h1>
            <p style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: '#4A6275', fontSize: '1rem', lineHeight: 1.6, maxWidth: 480, marginBottom: 8 }}>
              We'll highlight this group in the lesson library — but every lesson stays open, so explore wherever you like.
            </p>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', color: '#1A2E3B', background: 'rgba(26,46,59,0.06)', display: 'inline-block', padding: '6px 12px', borderRadius: 4, marginBottom: 32 }}>
              Group {recommendedGroup}: {groupTitle(recommendedGroup)}
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleFinish} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.5 : 1, cursor: saving ? 'wait' : 'pointer' }}>
                {saving ? 'saving…' : 'Go to my lessons →'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
