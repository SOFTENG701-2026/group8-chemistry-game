import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Container, Flex, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { PROBLEMS } from '../features/chem-assembler/data/problems';
import { CARD_DEF, FAMILY } from '../features/chem-assembler/data/cards';
import {
  FAMILY_LABEL,
  FILTER_CHIP_LABEL,
  getPrimaryFamily,
  lessonGroupData,
} from '../features/chem-assembler/data/lessonLibrary';
import {
  completeMasteries,
  fetchProgress,
  getLevelBuilds,
  isMoleculeMastered,
  MASTERED_BUILDS,
  resetProgress,
  type ProgressStore,
} from '../features/chem-assembler/api/progress';
import type { FamilyName } from '../features/chem-assembler/types';

type FilterValue = 'all' | FamilyName | 'unsolved';

function MasteryBadge({
  label,
  unlocked,
  color,
  detail,
  onClick,
}: {
  label: string;
  unlocked: boolean;
  color: string;
  detail: string;
  onClick: () => void;
}) {
  const badgeColor = unlocked ? color : '#8D948F';
  const borderColor = unlocked ? color : '#D3D1CB';
  const background = unlocked ? '#FFFFFF' : '#F0EEE9';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        minHeight: 70,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 8,
        background,
        color: '#1A2E3B',
        cursor: 'pointer',
        padding: '10px 12px',
        textAlign: 'left',
        opacity: unlocked ? 1 : 0.82,
      }}
      aria-label={`${label} badge, ${unlocked ? 'unlocked' : 'locked'}`}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `2px solid ${badgeColor}`,
          background: unlocked ? `${badgeColor}18` : '#E0DED8',
          display: 'grid',
          placeItems: 'center',
          color: badgeColor,
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 700,
          fontSize: '1rem',
          lineHeight: 1,
        }}
      >
        {unlocked ? '★' : '--'}
      </div>
      <div style={{ minWidth: 0 }}>
        <Text style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: badgeColor,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: 1.15,
        }}>
          {label}
        </Text>
        <Text style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.72rem',
          color: '#4A6275',
          lineHeight: 1.25,
          marginTop: 4,
        }}>
          {detail}
        </Text>
      </div>
    </button>
  );
}

const LEVEL_LABELS = ['L1', 'L2', 'L3'] as const;

function LevelPips({ level1, level2, level3 }: { level1: number; level2: number; level3: number }) {
  const counts = [level1, level2, level3];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {counts.map((builds, i) => {
        const label = LEVEL_LABELS[i];
        const color = builds >= MASTERED_BUILDS ? '#3C8D6A' : builds > 0 ? '#E2603F' : '#C9C5BB';
        const ratio = Math.min(builds / MASTERED_BUILDS, 1);
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              color: '#4A6275',
              width: 14,
              flexShrink: 0,
            }}>
              {label}
            </span>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EEE9DF', overflow: 'hidden' }}>
              <div style={{ width: `${ratio * 100}%`, height: '100%', background: color, transition: 'width 0.2s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MoleculeProgressCard({
  molecule,
  level1Builds,
  level2Builds,
  level3Builds,
  onClick,
}: {
  molecule: string;
  level1Builds: number;
  level2Builds: number;
  level3Builds: number;
  onClick: () => void;
}) {
  const problem = PROBLEMS.find(p => p.name === molecule);
  const family = getPrimaryFamily(molecule);
  const familyStyle = FAMILY[family];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'white',
        border: '1px solid #E5E1D8',
        borderRadius: 8,
        padding: '16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: hovered ? '0 2px 12px rgba(26,46,59,0.1)' : 'none',
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <Group gap={6}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: familyStyle.dot,
          flexShrink: 0,
        }} />
        <Text style={{
          color: familyStyle.dot,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}>
          {FAMILY_LABEL[family]}
        </Text>
      </Group>

      <Text style={{
        fontFamily: '"Fraunces", Georgia, serif',
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.2,
        color: '#1A2E3B',
      }}>
        {molecule}
      </Text>

      {problem && (
        <Text style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          color: '#4A6275',
          lineHeight: 1.4,
        }}>
          {problem.formula}
        </Text>
      )}

      {problem && (
        <Group gap={4} mt="auto" pt={4} align="center">
          {problem.correct.map((cardId, i) => {
            const card = CARD_DEF[cardId];
            const pieceStyle = card ? FAMILY[card.family as FamilyName] : FAMILY.alkyl;
            return (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 13,
                  backgroundColor: pieceStyle.bg,
                  border: `1px solid ${pieceStyle.border}`,
                  borderRadius: 3,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </Group>
      )}

      <LevelPips level1={level1Builds} level2={level2Builds} level3={level3Builds} />
    </div>
  );
}

export function Progress() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [progress, setProgress] = useState<ProgressStore | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [debugActionError, setDebugActionError] = useState<string | null>(null);
  const [debugActionPending, setDebugActionPending] = useState(false);
  const navigate = useNavigate();

  const allMolecules = useMemo(() => lessonGroupData.flatMap(l => l.molecules), []);
  const presentFamilies = useMemo<FamilyName[]>(() => {
    const families = new Set<FamilyName>();
    allMolecules.forEach(m => families.add(getPrimaryFamily(m)));
    return [...families];
  }, [allMolecules]);

  useEffect(() => {
    fetchProgress()
      .then((data) => {
        setProgress(data);
        setLoadError(null);
      })
      .catch(() => setLoadError('Progress is unavailable right now.'));
  }, []);

  function shouldShow(molecule: string): boolean {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unsolved') return (
      getLevelBuilds(progress, molecule, 1) === 0 &&
      getLevelBuilds(progress, molecule, 2) === 0 &&
      getLevelBuilds(progress, molecule, 3) === 0
    );
    return getPrimaryFamily(molecule) === activeFilter;
  }

  const visibleMolecules = allMolecules.filter(shouldShow);
  const masteredCount = visibleMolecules.filter(molecule => isMoleculeMastered(progress, molecule)).length;
  const totalBuilds = visibleMolecules.reduce(
    (sum, molecule) => sum + getLevelBuilds(progress, molecule, 1) + getLevelBuilds(progress, molecule, 2) + getLevelBuilds(progress, molecule, 3),
    0,
  );
  const possibleBuilds = visibleMolecules.length * MASTERED_BUILDS * 3;
  const completion = possibleBuilds === 0 ? 0 : totalBuilds / possibleBuilds;
  const globalProgressColor = completion >= 1 ? '#3C8D6A' : '#E2603F';
  const ultimateUnlocked = allMolecules.every(molecule => isMoleculeMastered(progress, molecule));

  const familyBadges = presentFamilies.map((family) => {
    const molecules = allMolecules.filter(molecule => getPrimaryFamily(molecule) === family);
    const familyMasteredCount = molecules.filter(molecule => isMoleculeMastered(progress, molecule)).length;
    const unlocked = molecules.length > 0 && familyMasteredCount === molecules.length;

    return {
      family,
      label: `${FILTER_CHIP_LABEL[family] ?? FAMILY_LABEL[family]} mastery`,
      unlocked,
      detail: `${familyMasteredCount}/${molecules.length} mastered`,
      color: FAMILY[family].dot,
    };
  });

  const chipStyle = (isActive: boolean): CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 100,
    border: `1.5px solid ${isActive ? '#1A2E3B' : '#C9C5BB'}`,
    backgroundColor: isActive ? '#1A2E3B' : 'transparent',
    color: isActive ? 'white' : '#1A2E3B',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    lineHeight: 1,
  });

  const debugButtonStyle = (variant: 'primary' | 'danger'): CSSProperties => ({
    border: `1.5px solid ${variant === 'primary' ? '#1A2E3B' : '#B34A33'}`,
    backgroundColor: variant === 'primary' ? '#1A2E3B' : 'transparent',
    color: variant === 'primary' ? '#FFFFFF' : '#B34A33',
    borderRadius: 8,
    padding: '9px 14px',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: debugActionPending ? 'not-allowed' : 'pointer',
    opacity: debugActionPending ? 0.55 : 1,
  });

  async function handleResetProgress() {
    setDebugActionPending(true);
    setDebugActionError(null);
    try {
      setProgress(await resetProgress());
    } catch {
      setDebugActionError('Could not reset progress.');
    } finally {
      setDebugActionPending(false);
    }
  }

  async function handleCompleteSelectedFilter() {
    setDebugActionPending(true);
    setDebugActionError(null);
    try {
      setProgress(await completeMasteries(visibleMolecules));
    } catch {
      setDebugActionError('Could not complete selected masteries.');
    } finally {
      setDebugActionPending(false);
    }
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Container size="xl">
        <Text style={{
          color: '#E2603F',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          marginBottom: 8,
        }}>
          Mastery tracker
        </Text>

        <h1 style={{ margin: '0 0 8px' }}>My progress</h1>

        <Text style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontStyle: 'italic',
          color: '#4A6275',
          fontSize: '1rem',
          marginBottom: 28,
        }}>
          Build each molecule correctly three times to master it.
        </Text>

        <Flex gap={8} mb={24} wrap="wrap" align="center">
          <button style={chipStyle(activeFilter === 'all')} onClick={() => setActiveFilter('all')}>
            All
          </button>
          {presentFamilies.map(family => (
            <button
              key={family}
              style={chipStyle(activeFilter === family)}
              onClick={() => setActiveFilter(family)}
            >
              {FILTER_CHIP_LABEL[family] ?? FAMILY_LABEL[family]}
            </button>
          ))}
          <button style={chipStyle(activeFilter === 'unsolved')} onClick={() => setActiveFilter('unsolved')}>
            Unsolved
          </button>
        </Flex>

        <section
          style={{
            border: '1px dashed #C9C5BB',
            borderRadius: 8,
            padding: 14,
            marginBottom: 30,
          }}
        >
          <Group justify="space-between" align="center" gap={12}>
            <Text style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4A6275',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}>
              Debug controls
            </Text>
            <Group gap={8}>
              <button
                type="button"
                style={debugButtonStyle('primary')}
                onClick={handleCompleteSelectedFilter}
                disabled={debugActionPending || visibleMolecules.length === 0}
              >
                Complete selected filter
              </button>
              <button
                type="button"
                style={debugButtonStyle('danger')}
                onClick={handleResetProgress}
                disabled={debugActionPending}
              >
                Reset progress
              </button>
            </Group>
          </Group>
          {debugActionError && (
            <Text style={{ color: '#B34A33', marginTop: 10, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
              {debugActionError}
            </Text>
          )}
        </section>

        <section style={{ marginBottom: 34 }}>
          <Group justify="space-between" align="baseline" mb={14}>
            <Text style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4A6275',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}>
              Mastery badges
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#4A6275',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}>
              {familyBadges.filter(badge => badge.unlocked).length + (ultimateUnlocked ? 1 : 0)}/{familyBadges.length + 1} unlocked
            </Text>
          </Group>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
          }}>
            <MasteryBadge
              label="Ultimate mastery"
              unlocked={ultimateUnlocked}
              color="#B8860B"
              detail={`${allMolecules.filter(molecule => isMoleculeMastered(progress, molecule)).length}/${allMolecules.length} mastered`}
              onClick={() => setActiveFilter('all')}
            />
            {familyBadges.map(badge => (
              <MasteryBadge
                key={badge.family}
                label={badge.label}
                unlocked={badge.unlocked}
                color={badge.color}
                detail={badge.detail}
                onClick={() => setActiveFilter(badge.family)}
              />
            ))}
          </div>
        </section>

        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E1D8',
            borderRadius: 8,
            padding: 18,
            marginBottom: 40,
          }}
        >
          <Group justify="space-between" align="flex-start" gap={16} mb={12}>
            <div>
              <Text style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#4A6275',
                fontFamily: '"DM Sans", system-ui, sans-serif',
              }}>
                Selected filter
              </Text>
              <Text style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#1A2E3B',
              }}>
                {activeFilter === 'all'
                  ? 'All molecules'
                  : activeFilter === 'unsolved'
                    ? 'Unsolved molecules'
                    : FILTER_CHIP_LABEL[activeFilter] ?? FAMILY_LABEL[activeFilter]}
              </Text>
            </div>
            <Text style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              color: '#4A6275',
              textAlign: 'right',
            }}>
              {totalBuilds}/{possibleBuilds} builds
              <br />
              {masteredCount}/{visibleMolecules.length} mastered
            </Text>
          </Group>
          <div style={{ height: 10, borderRadius: 999, background: '#EEE9DF', overflow: 'hidden' }}>
            <div
              style={{
                width: `${completion * 100}%`,
                height: '100%',
                background: globalProgressColor,
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </section>

        {loadError && (
          <Text style={{ color: '#B34A33', marginBottom: 24, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
            {loadError}
          </Text>
        )}

        {lessonGroupData.map(level => {
          const visible = level.molecules.filter(shouldShow);
          if (visible.length === 0) return null;

          return (
            <section key={level.groupId} style={{ marginBottom: 56 }}>
              <Group justify="space-between" align="baseline" mb={16}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#4A6275',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}>
                  {level.title}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#4A6275',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}>
                  {visible.length} {visible.length === 1 ? 'molecule' : 'molecules'}
                </Text>
              </Group>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
              }}>
                {visible.map(molecule => (
                  <MoleculeProgressCard
                    key={molecule}
                    molecule={molecule}
                    level1Builds={getLevelBuilds(progress, molecule, 1)}
                    level2Builds={getLevelBuilds(progress, molecule, 2)}
                    level3Builds={getLevelBuilds(progress, molecule, 3)}
                    onClick={() => navigate(`/lesson?molecule=${encodeURIComponent(molecule)}`)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </div>
  );
}
