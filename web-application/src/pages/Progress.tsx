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
  levelData,
} from '../features/chem-assembler/data/lessonLibrary';
import { fetchProgress, type ProgressStore } from '../features/chem-assembler/api/progress';
import type { FamilyName } from '../features/chem-assembler/types';

type FilterValue = 'all' | FamilyName | 'unsolved';

const MASTERED_BUILDS = 3;

function getBuildCount(progress: ProgressStore | null, molecule: string) {
  return Math.min(progress?.molecules[molecule]?.successfulBuilds ?? 0, MASTERED_BUILDS);
}

function getStatusLabel(builds: number) {
  if (builds >= MASTERED_BUILDS) return 'Mastered';
  if (builds > 0) return 'In progress';
  return 'Not mastered';
}

function isMastered(progress: ProgressStore | null, molecule: string) {
  return getBuildCount(progress, molecule) >= MASTERED_BUILDS;
}

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
        {unlocked ? 'M' : '--'}
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

function ProgressBar({ builds }: { builds: number }) {
  const ratio = Math.min(builds / MASTERED_BUILDS, 1);
  const color = builds >= MASTERED_BUILDS ? '#3C8D6A' : builds > 0 ? '#E2603F' : '#C9C5BB';

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div
        aria-label={`${builds} of ${MASTERED_BUILDS} successful builds`}
        style={{
          height: 8,
          borderRadius: 999,
          background: '#EEE9DF',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: '100%',
            background: color,
            transition: 'width 0.2s ease',
          }}
        />
      </div>
      <Group justify="space-between" gap={8}>
        <Text style={{ fontSize: 11, color: '#4A6275', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          {getStatusLabel(builds)}
        </Text>
        <Text style={{ fontSize: 11, color: '#4A6275', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          {builds}/{MASTERED_BUILDS}
        </Text>
      </Group>
    </div>
  );
}

function MoleculeProgressCard({
  molecule,
  builds,
  onClick,
}: {
  molecule: string;
  builds: number;
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

      <ProgressBar builds={builds} />
    </div>
  );
}

export function Progress() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [progress, setProgress] = useState<ProgressStore | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const allMolecules = useMemo(() => levelData.flatMap(l => l.molecules), []);
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
    if (activeFilter === 'unsolved') return getBuildCount(progress, molecule) === 0;
    return getPrimaryFamily(molecule) === activeFilter;
  }

  const visibleMolecules = allMolecules.filter(shouldShow);
  const totalBuilds = visibleMolecules.reduce((sum, molecule) => sum + getBuildCount(progress, molecule), 0);
  const possibleBuilds = visibleMolecules.length * MASTERED_BUILDS;
  const masteredCount = visibleMolecules.filter(molecule => isMastered(progress, molecule)).length;
  const completion = possibleBuilds === 0 ? 0 : totalBuilds / possibleBuilds;
  const ultimateUnlocked = allMolecules.every(molecule => isMastered(progress, molecule));

  const familyBadges = presentFamilies.map((family) => {
    const molecules = allMolecules.filter(molecule => getPrimaryFamily(molecule) === family);
    const familyMasteredCount = molecules.filter(molecule => isMastered(progress, molecule)).length;
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
              detail={`${allMolecules.filter(molecule => isMastered(progress, molecule)).length}/${allMolecules.length} mastered`}
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
                background: '#3C8D6A',
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

        {levelData.map(level => {
          const visible = level.molecules.filter(shouldShow);
          if (visible.length === 0) return null;

          return (
            <section key={level.levelId} style={{ marginBottom: 56 }}>
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
                    builds={getBuildCount(progress, molecule)}
                    onClick={() => navigate(`/sandbox?molecule=${encodeURIComponent(molecule)}`)}
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
