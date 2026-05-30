import { Modal } from '@mantine/core';
import type { CSSProperties, ReactNode } from 'react';

// ── Design tokens (match LessonPage / Onboarding) ───────────────────────────────
const INK = '#1A2E3B';
const MUTED = '#4A6275';
const ACCENT = '#E2603F';
const SERIF = '"Fraunces", Georgia, serif';
const SANS = '"DM Sans", system-ui, sans-serif';
const MONO = '"JetBrains Mono", monospace';

const sectionLabel: CSSProperties = {
  color: ACCENT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontFamily: SANS,
  marginBottom: 6,
};

const heading: CSSProperties = {
  fontFamily: SERIF,
  fontSize: '1.4rem',
  fontWeight: 600,
  color: INK,
  margin: '0 0 10px',
};

const body: CSSProperties = {
  fontFamily: SANS,
  fontSize: '0.95rem',
  lineHeight: 1.6,
  color: MUTED,
  margin: 0,
};

const list: CSSProperties = {
  ...body,
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

function Key({ children }: { children: ReactNode }) {
  return (
    <span style={{
      fontFamily: MONO,
      fontSize: '0.85em',
      fontWeight: 600,
      color: INK,
      background: 'rgba(26,46,59,0.06)',
      padding: '1px 6px',
      borderRadius: 4,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function Strong({ children }: { children: ReactNode }) {
  return <strong style={{ color: INK, fontWeight: 600 }}>{children}</strong>;
}

export function HowToPlayModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title="How to play"
      styles={{
        title: { fontFamily: SERIF, fontWeight: 700, fontSize: '1.5rem', color: INK },
        body: { paddingTop: 8 },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Section A — Reagent cards */}
        <section>
          <div style={sectionLabel}>Building with reagent cards</div>
          <h3 style={heading}>Snap functional-group pieces together</h3>
          <ul style={list}>
            <li>
              The <Strong>reagent tray</Strong> at the bottom holds the available pieces. The{' '}
              <Strong>assembly bench</Strong> at the top is where you build the molecule.
            </li>
            <li>
              <Strong>Click</Strong> a card to send it up to the bench, or <Strong>drag</Strong>{' '}
              it there. Click or drag a card in the bench to send it back to the tray.
            </li>
            <li>
              <Strong>Order matters</Strong> — pieces line up left to right in the order you add them.
            </li>
            <li>
              The little dashes on a card are its <Strong>bonds</Strong>: a trailing dash{' '}
              (<Key>CH₃—</Key>) joins to the right, a leading dash (<Key>—OH</Key>) joins to
              the left, and dashes on both sides (<Key>—CH₂—</Key>) sit in the middle. Pick
              pieces whose dashes meet.
            </li>
            <li>
              Press <Strong>check</Strong> to test your build, <Strong>reset</Strong> to clear
              the bench, or <Strong>hint</Strong> if you're stuck. Green means correct; a red
              shake means not quite — check the order or the functional groups.
            </li>
          </ul>
        </section>

        {/* Section B — Lewis builder */}
        <section>
          <div style={sectionLabel}>The Lewis builder</div>
          <h3 style={heading}>Place atoms and draw bonds</h3>
          <ul style={list}>
            <li>
              <Strong>Drag an atom</Strong> from the Atoms palette onto the canvas to place it.
              Drag a placed atom to move it around.
            </li>
            <li>
              <Strong>Drag from one atom to another</Strong> to draw a bond between them. A bond
              only connects if <Strong>both atoms still have a free slot</Strong> — once an
              atom's bonds are full, further connections are rejected.
            </li>
            <li>
              <Strong>Click a bond</Strong> to select it, then click it again to toggle between
              a single and a double bond.
            </li>
            <li>
              Select an atom or bond and press <Strong>Delete</Strong> (or the Delete button) to
              remove it. The readout names your molecule whenever it recognises the structure.
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}
