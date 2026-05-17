import { useState } from 'react';
import { Container, Title, Text, SimpleGrid, Card, Group, Button, Pill, Flex } from '@mantine/core';
import { NavLink as RouterNavLink } from 'react-router';
import { AppHeader } from '../components/AppHeader';

const levelData = [
  {
    levelId: 1,
    title: "The Basics",
    description: "Simple hydrocarbons and basic functional groups.",
    molecules: [
      "Methane",
      "Ethane",
      "Propane",
      "Butane",
      "Methanol",
      "Ethanol",
      "Propan-1-ol",
      "Ethene",
      "Propene",
      "Chloroethane"
    ]
  },
  {
    levelId: 2,
    title: "Branching & New Groups",
    description: "Amines, carboxylic acids, and structural isomers.",
    molecules: [
      "Ethanoic Acid",
      "Propanoic Acid",
      "Ethanamine",
      "Propan-1-amine",
      "2-methylpropane",
      "Propan-2-ol",
      "Butan-2-ol",
      "1-chloropropane",
      "2-chloropropane",
      "But-2-ene"
    ]
  },
  {
    levelId: 3,
    title: "Esters & Complex Chains",
    description: "Esterification and larger combinations.",
    molecules: [
      "Methyl ethanoate",
      "Ethyl ethanoate",
      "Propyl methanoate",
      "Butyl ethanoate",
      "Propanamide",
      "Ethanoyl chloride",
      "Ethan-1,2-diol",
      "2-chloro-2-methylpropane",
      "2-hydroxypropanoic acid (Lactic Acid)",
      "Glycine (Amino Acid)"
    ]
  }
];

export function Levels() {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

  const displayedLevels = selectedLevelId === null 
    ? levelData 
    : levelData.filter(l => l.levelId === selectedLevelId);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <AppHeader />
      
      <Container size="xl">
        <Title order={1} mb="xl" style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '3rem', color: 'var(--text)' }}>
          Lesson Library
        </Title>
        
        <Flex gap="sm" mb={40} wrap="wrap">
          <Pill 
            size="lg" 
            style={{ 
              backgroundColor: selectedLevelId === null ? '#1A2E3B' : 'white', 
              color: selectedLevelId === null ? 'white' : '#1A2E3B', 
              fontWeight: 600, 
              padding: '8px 16px', 
              height: 'auto', 
              border: '1.5px solid #1A2E3B',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedLevelId(null)}
          >
            All Levels
          </Pill>
          {levelData.map(level => (
            <Pill 
              key={level.levelId}
              size="lg" 
              style={{ 
                backgroundColor: selectedLevelId === level.levelId ? '#1A2E3B' : 'white', 
                color: selectedLevelId === level.levelId ? 'white' : '#1A2E3B', 
                fontWeight: 500, 
                padding: '8px 16px', 
                height: 'auto', 
                border: '1.5px solid #1A2E3B',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedLevelId(level.levelId)}
            >
              Level {level.levelId}: {level.title}
            </Pill>
          ))}
        </Flex>

        {displayedLevels.map(level => (
          <section key={level.levelId} style={{ marginBottom: '60px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Title order={2} style={{ fontFamily: 'var(--heading)' }}>Level {level.levelId}: {level.title}</Title>
              <Text style={{ color: '#4A6275', fontSize: '1.1rem' }}>{level.description}</Text>
            </div>
            
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing="lg">
              {level.molecules.map((molecule) => (
                <Card key={molecule} shadow="sm" padding="lg" radius="md" style={{ border: '1.5px solid #1A2E3B', display: 'flex', flexDirection: 'column' }}>
                  <Card.Section>
                    {/* Image Placeholder */}
                    <div style={{ height: 140, backgroundColor: '#E0DCD1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1.5px solid #1A2E3B' }}>
                      <Text style={{ color: '#4A6275', fontSize: '0.9rem' }}>{molecule} Image</Text>
                    </div>
                  </Card.Section>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Text fw={700} size="lg" mb="md" style={{ lineHeight: 1.2 }}>{molecule}</Text>
                    <Button 
                      component={RouterNavLink} 
                      to={`/sandbox?molecule=${encodeURIComponent(molecule)}`} 
                      variant="filled" 
                      fullWidth 
                      radius="md" 
                      rightSection="→" 
                      style={{ backgroundColor: '#1A2E3B', color: 'white' }}
                    >
                      Start
                    </Button>
                  </div>
                </Card>
              ))}
            </SimpleGrid>
          </section>
        ))}

      </Container>
    </div>
  );
}
