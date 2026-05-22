import type { CSSProperties } from 'react';
import { useState, useMemo } from 'react';
import { Container, Text, Group, Flex } from '@mantine/core';
import { useNavigate } from 'react-router';
import { PROBLEMS } from '../features/chem-assembler/data/problems';
import { CARD_DEF, FAMILY } from '../features/chem-assembler/data/cards';
import type { FamilyName } from '../features/chem-assembler/types';

const levelData = [
  {
    levelId: 1,
    title: 'The Basics',
    molecules: [
      'Methane', 'Ethane', 'Propane', 'Butane',
      'Methanol', 'Ethanol', 'Propan-1-ol',
      'Ethene', 'Propene', 'Chloroethane',
    ],
  },
  {
    levelId: 2,
    title: 'Branching & New Groups',
    molecules: [
      'Ethanoic Acid', 'Propanoic Acid', 'Ethanamine', 'Propan-1-amine',
      '2-methylpropane', 'Propan-2-ol', 'Butan-2-ol',
      '1-chloropropane', '2-chloropropane', 'But-2-ene',
    ],
  },
  {
    levelId: 3,
    title: 'Esters & Complex Chains',
    molecules: [
      'Methyl ethanoate', 'Ethyl ethanoate', 'Propyl methanoate', 'Butyl ethanoate',
      'Propanamide', 'Ethanoyl chloride', 'Ethan-1,2-diol',
      '2-chloro-2-methylpropane', '2-hydroxypropanoic acid (Lactic Acid)', 'Glycine (Amino Acid)',
    ],
  },
];

const FAMILY_LABEL: Record<FamilyName, string> = {
  alkyl: 'ALKANE',
  alcohol: 'ALCOHOL',
  amine: 'AMINE',
  acid: 'CARBOXYLIC ACID',
  aldehyde: 'ALDEHYDE',
  ketone: 'KETONE',
  ether: 'ETHER',
  ester: 'ESTER',
  amide: 'AMIDE',
  aromatic: 'AROMATIC',
  nitro: 'NITRO',
  halide: 'HALOALKANE',
};

const FILTER_CHIP_LABEL: Partial<Record<FamilyName, string>> = {
  alkyl: 'Alkanes',
  alcohol: 'Alcohols',
  amine: 'Amines',
  acid: 'Acids',
  aldehyde: 'Aldehydes',
  ketone: 'Ketones',
  ether: 'Ethers',
  ester: 'Esters',
  amide: 'Amides',
  aromatic: 'Aromatics',
  nitro: 'Nitro',
  halide: 'Haloalkanes',
};

type FilterValue = 'all' | FamilyName | 'unsolved';

function getPrimaryFamily(moleculeName: string): FamilyName {
  const problem = PROBLEMS.find(p => p.name === moleculeName);
  if (!problem) return 'alkyl';
  for (const cardId of problem.correct) {
    const card = CARD_DEF[cardId];
    if (card && card.family !== 'alkyl') return card.family as FamilyName;
  }
  return 'alkyl';
}

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
      {/* Category */}
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

      {/* Name */}
      <Text style={{
        fontFamily: '"Fraunces", Georgia, serif',
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.2,
        color: '#1A2E3B',
      }}>
        {molecule}
      </Text>

      {/* Formula */}
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

      {/* Piece squares + count */}
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

export function Levels() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const navigate = useNavigate();

  const allMolecules = levelData.flatMap(l => l.molecules);
  const totalCount = allMolecules.length;

  const presentFamilies = useMemo<FamilyName[]>(() => {
    const families = new Set<FamilyName>();
    allMolecules.forEach(m => families.add(getPrimaryFamily(m)));
    return [...families];
  }, []);

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
        {/* Page header */}
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

        {/* Filter chips */}
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

        {/* Level sections */}
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
                  <MoleculeCard
                    key={molecule}
                    molecule={molecule}
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
