import type { CSSProperties, ReactNode } from 'react';
import { Container, Text, Group } from '@mantine/core';
import { NavLink as RouterNavLink } from 'react-router';
import { CARD_DEF, FAMILY } from '../features/chem-assembler/data/cards';
import type { FamilyName } from '../features/chem-assembler/types';

function getRepresentativeCards(excludeFamilies: FamilyName[], limit: number) {
  const seen = new Set<FamilyName>();
  const result: { id: string; display: string; family: FamilyName }[] = [];
  for (const [id, def] of Object.entries(CARD_DEF)) {
    if (excludeFamilies.includes(def.family as FamilyName)) continue;
    if (seen.has(def.family as FamilyName)) continue;
    seen.add(def.family as FamilyName);
    result.push({ id, display: def.display, family: def.family as FamilyName });
    if (result.length >= limit) break;
  }
  return result;
}

function ChemChip({ display, family }: { display: string; family: FamilyName }) {
  const style = FAMILY[family];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: 6,
      backgroundColor: style.bg,
      border: `1px solid ${style.border}`,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.75rem',
      color: '#1A2E3B',
      whiteSpace: 'nowrap',
    }}>
      {display}
    </span>
  );
}

const lessonChips = getRepresentativeCards(['alkyl'], 3);
const sandboxChips = getRepresentativeCards(['alkyl', 'alcohol', 'amine', 'acid'], 4);

const cardBase: CSSProperties = {
  borderRadius: 12,
  border: '1.5px solid rgba(26,46,59,0.15)',
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

function CounterBadge({ n }: { n: string }) {
  return (
    <span style={{
      width: 28,
      height: 28,
      border: '1.5px solid currentColor',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 600,
      flexShrink: 0,
    }}>
      {n}
    </span>
  );
}

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <Text style={{
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
      fontSize: '10px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#E2603F',
    }}>
      {children}
    </Text>
  );
}

export function Home() {
  return (
    <div style={{ paddingBottom: '60px' }}>
      <Container size="xl">
        {/* Hero */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ margin: '0 0 12px', lineHeight: 1.05 }}>
            Build chemistry,{' '}
            <span style={{ color: '#E2603F', fontStyle: 'italic' }}>one bond</span>{' '}
            at a time.
          </h1>
          <Text style={{
            color: '#4A6275',
            fontSize: '1rem',
            maxWidth: 520,
            lineHeight: 1.6,
          }}>
            Assemble molecules from functional-group cards. Pick a path below — guided lessons, open sandbox, or check your progress.
          </Text>
        </div>

        {/* Cards row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          alignItems: 'stretch',
        }}>
          {/* Lessons card */}
          <div style={{ ...cardBase, backgroundColor: 'white' }}>
            <Group justify="space-between" align="center" mb={20} style={{ color: '#1A2E3B' }}>
              <CardLabel>Guided · 12 specimens</CardLabel>
              <CounterBadge n="01" />
            </Group>

            <h2 style={{ margin: '0 0 8px' }}>Lessons</h2>
            <Text style={{ color: '#4A6275', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
              Step through molecules from methanol to diethyl ether. Hints, streaks, immediate feedback.
            </Text>

            <Group gap={6} mb="auto" wrap="wrap">
              {lessonChips.map(c => (
                <ChemChip key={c.id} display={c.display} family={c.family} />
              ))}
            </Group>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(26,46,59,0.1)' }}>
              <RouterNavLink
                to="/lessons"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 20px',
                  backgroundColor: '#1A2E3B',
                  color: 'white',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                continue →
              </RouterNavLink>
            </div>
          </div>

          {/* Sandbox card */}
          <div style={{ ...cardBase, backgroundColor: '#1A2E3B', border: '1.5px solid #1A2E3B' }}>
            <Group justify="space-between" align="center" mb={20} style={{ color: 'rgba(255,255,255,0.7)' }}>
              <CardLabel>Open · No target</CardLabel>
              <span style={{
                width: 28, height: 28,
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                flexShrink: 0,
              }}>
                02
              </span>
            </Group>

            <h2 style={{ margin: '0 0 8px', color: 'white' }}>Sandbox</h2>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
              Free build. Assemble anything from the full pantry — we'll name it if it's a valid compound.
            </Text>

            <Group gap={6} mb="auto" wrap="wrap">
              {sandboxChips.map(c => (
                <ChemChip key={c.id} display={c.display} family={c.family} />
              ))}
            </Group>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <RouterNavLink
                to="/sandbox"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                open bench →
              </RouterNavLink>
            </div>
          </div>

          {/* My Progress card */}
          <div style={{ ...cardBase, backgroundColor: 'white' }}>
            <Group justify="space-between" align="center" mb={20} style={{ color: '#1A2E3B' }}>
              <CardLabel>Your record</CardLabel>
              <CounterBadge n="03" />
            </Group>

            <h2 style={{ margin: '0 0 8px' }}>My progress</h2>
            <Text style={{ color: '#4A6275', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
              Mastery per functional-group family, streaks, attempt history, and the heatmap.
            </Text>

            <div style={{ flex: 1 }} />

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(26,46,59,0.1)' }}>
              <Text style={{ color: '#4A6275', fontSize: '0.8rem', marginBottom: 12 }}>
                12 families tracked
              </Text>
              <RouterNavLink
                to="/progress"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#1A2E3B',
                  border: '1.5px solid rgba(26,46,59,0.3)',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                see all →
              </RouterNavLink>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
