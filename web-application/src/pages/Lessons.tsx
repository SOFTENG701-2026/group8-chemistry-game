import type { CSSProperties } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Container, Text, Group, Flex } from '@mantine/core';
import { IconClipboardCheck, IconLock, IconLockOpen } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { PROBLEMS } from '../features/chem-assembler/data/problems';
import {
  fetchProgress,
  isMoleculeMastered,
  type ProgressStore,
} from '../features/chem-assembler/api/progress';
import { CARD_DEF, FAMILY } from '../features/chem-assembler/data/cards';
import {
  FAMILY_LABEL,
  FILTER_CHIP_LABEL,
  getPrimaryFamily,
  lessonGroupData,
} from '../features/chem-assembler/data/lessonLibrary';
import { getRevisionQuiz } from '../features/chem-assembler/data/revisionQuizzes';
import type { FamilyName } from '../features/chem-assembler/types';

type FilterValue = 'all' | FamilyName | 'unsolved';

function MoleculeCard({ molecule, onClick }: { molecule: string; onClick: () => void }) {
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
        gap: 6,
        boxShadow: hovered ? '0 2px 12px rgba(26,46,59,0.1)' : 'none',
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <Group gap={6} mb={4}>
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
        <Group gap={4} mt="auto" pt={10} align="center">
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
          <Text style={{
            fontSize: 11,
            color: '#4A6275',
            marginLeft: 4,
            fontFamily: '"DM Sans", system-ui, sans-serif',
            whiteSpace: 'nowrap',
          }}>
            {problem.correct.length} {problem.correct.length === 1 ? 'piece' : 'pieces'}
          </Text>
        </Group>
      )}
    </div>
  );
}

function RevisionQuizCard({
  groupId,
  groupTitle,
  masteredCount,
  totalCount,
  unlocked,
  onClick,
}: {
  groupId: number;
  groupTitle: string;
  masteredCount: number;
  totalCount: number;
  unlocked: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        minHeight: 142,
        backgroundColor: unlocked ? '#FFFFFF' : '#F0EEE9',
        border: `1.5px solid ${unlocked ? '#3C8D6A' : '#D3D1CB'}`,
        borderRadius: 8,
        padding: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        textAlign: 'left',
        opacity: unlocked ? 1 : 0.86,
        boxShadow: hovered ? '0 2px 12px rgba(26,46,59,0.1)' : 'none',
        transition: 'box-shadow 0.15s ease',
      }}
      aria-label={`${groupTitle} revision quiz, ${unlocked ? 'unlocked' : 'locked'}`}
    >
      <Group gap={8} align="center">
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: unlocked ? '#E1F1E9' : '#E0DED8',
          color: unlocked ? '#3C8D6A' : '#777C78',
          flexShrink: 0,
        }}>
          {unlocked ? <IconLockOpen size={17} stroke={2.2} /> : <IconLock size={17} stroke={2.2} />}
        </div>
        <Text style={{
          color: unlocked ? '#3C8D6A' : '#777C78',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}>
          {unlocked ? 'Revision unlocked' : 'Revision locked'}
        </Text>
      </Group>

      <Text style={{
        fontFamily: '"Fraunces", Georgia, serif',
        fontWeight: 650,
        fontSize: '1.08rem',
        lineHeight: 1.2,
        color: '#1A2E3B',
      }}>
        {groupTitle} quiz
      </Text>

      <Text style={{
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: '0.78rem',
        color: '#4A6275',
        lineHeight: 1.35,
      }}>
        {unlocked
          ? 'Review the key functional groups, chain patterns, and naming clues from this set.'
          : `Master every molecule in this group to unlock: ${masteredCount}/${totalCount} mastered.`}
      </Text>

      <Group gap={6} mt="auto" align="center" style={{ color: unlocked ? '#1A2E3B' : '#777C78' }}>
        <IconClipboardCheck size={16} stroke={2.2} />
        <Text style={{
          fontSize: 12,
          fontWeight: 700,
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}>
          Group {groupId} revision
        </Text>
      </Group>
    </button>
  );
}

export function Lessons() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [recommendedGroup, setRecommendedGroup] = useState<number | null>(null);
  const [progress, setProgress] = useState<ProgressStore | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress()
      .then((store) => {
        setProgress(store);
        setRecommendedGroup(store.diagnostic?.recommendedGroup ?? null);
      })
      .catch(console.error);
  }, []);

  const allMolecules = useMemo(() => lessonGroupData.flatMap(l => l.molecules), []);
  const totalCount = allMolecules.length;

  const presentFamilies = useMemo<FamilyName[]>(() => {
    const families = new Set<FamilyName>();
    allMolecules.forEach(m => families.add(getPrimaryFamily(m)));
    return [...families];
  }, [allMolecules]);

  function shouldShow(molecule: string): boolean {
    if (activeFilter === 'all' || activeFilter === 'unsolved') return true;
    return getPrimaryFamily(molecule) === activeFilter;
  }

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
          Pick a specimen
        </Text>

        <h1 style={{ margin: '0 0 8px' }}>Lesson library</h1>

        <Text style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontStyle: 'italic',
          color: '#4A6275',
          fontSize: '1rem',
          marginBottom: 32,
        }}>
          {totalCount} molecules, ordered by difficulty.
        </Text>

        <Flex gap={8} mb={48} wrap="wrap" align="center">
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

        {lessonGroupData.map(group => {
          const visible = group.molecules.filter(shouldShow);
          if (visible.length === 0) return null;

          const isRecommended = recommendedGroup === group.groupId;

          return (
            <section
              key={group.groupId}
              style={{
                marginBottom: 56,
                ...(isRecommended ? {
                  border: '1.5px solid #E2603F',
                  borderRadius: 12,
                  padding: 20,
                  backgroundColor: 'rgba(226,96,63,0.04)',
                } : {}),
              }}
            >
              <Group justify="space-between" align="baseline" mb={16}>
                <Group gap={10} align="baseline">
                  <Text style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#4A6275',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                  }}>
                    {group.title}
                  </Text>
                  {isRecommended && (
                    <Text style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'white',
                      backgroundColor: '#E2603F',
                      borderRadius: 100,
                      padding: '3px 10px',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                    }}>
                      Recommended for you
                    </Text>
                  )}
                </Group>
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
                {getRevisionQuiz(group.groupId) && (() => {
                  const masteredCount = group.molecules.filter(molecule => isMoleculeMastered(progress, molecule)).length;
                  const unlocked = masteredCount === group.molecules.length;

                  return (
                    <RevisionQuizCard
                      groupId={group.groupId}
                      groupTitle={group.title}
                      masteredCount={masteredCount}
                      totalCount={group.molecules.length}
                      unlocked={unlocked}
                      onClick={() => navigate(`/revision-quiz?group=${group.groupId}`)}
                    />
                  );
                })()}
                {visible.map(molecule => (
                  <MoleculeCard
                    key={molecule}
                    molecule={molecule}
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
