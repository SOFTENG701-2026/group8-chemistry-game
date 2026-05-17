import { Container, Title, Text, SimpleGrid, Card, Button } from '@mantine/core';
import { NavLink as RouterNavLink } from 'react-router';
import { AppHeader } from '../components/AppHeader';

export function Home() {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <AppHeader />
      
      <Container size="xl">
        <Title order={1} style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '3rem', color: 'var(--text)' }}>
          Welcome back, Student!
        </Title>
        <Text size="xl" mt="sm" mb={50} style={{ color: '#4A6275' }}>
          Ready to explore the building blocks of the universe?
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {/* Lessons Card */}
          <Card shadow="sm" padding="xl" radius="md" style={{ backgroundColor: '#FFF9E6', border: '1.5px solid #1A2E3B' }}>
            <Card.Section p="xl">
              <Title order={2} mb="md" style={{ fontFamily: 'var(--heading)' }}>Lessons</Title>
              <Text mb="xl" style={{ color: '#4A6275' }}>Continue your journey through chemistry.</Text>
              
              <Card shadow="xs" p="md" radius="sm" withBorder style={{ backgroundColor: 'white', borderColor: '#1A2E3B' }}>
                <Text fw={700} mb="xs">Current Lesson</Text>
                <Title order={3} size="h4" mb="md" style={{ fontFamily: 'var(--heading)' }}>Acetic acid</Title>
                <Button component={RouterNavLink} to="/levels" variant="filled" color="orange" fullWidth rightSection="→" style={{ backgroundColor: '#E2603F', color: 'white' }}>
                  Continue
                </Button>
              </Card>
            </Card.Section>
          </Card>

          {/* Sandbox Card */}
          <Card shadow="sm" padding="xl" radius="md" style={{ backgroundColor: '#E6F3FF', border: '1.5px solid #1A2E3B', display: 'flex', flexDirection: 'column' }}>
            <Card.Section p="xl" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Title order={2} mb="md" style={{ fontFamily: 'var(--heading)' }}>Sandbox</Title>
              <Text mb="xl" style={{ color: '#4A6275' }}>Experiment freely with atoms and molecules.</Text>
              
              <Button component={RouterNavLink} to="/sandbox" variant="filled" color="blue" fullWidth rightSection="→" mt="auto" style={{ backgroundColor: '#1A2E3B', color: 'white' }}>
                Open Bench
              </Button>
            </Card.Section>
          </Card>

          {/* My Progress Card */}
          <Card shadow="sm" padding="xl" radius="md" style={{ backgroundColor: '#E6FFE6', border: '1.5px solid #1A2E3B', display: 'flex', flexDirection: 'column' }}>
            <Card.Section p="xl" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Title order={2} mb="md" style={{ fontFamily: 'var(--heading)' }}>My Progress</Title>
              <Text mb="xl" style={{ color: '#4A6275' }}>Track your learning and achievements.</Text>
              
              <Button component={RouterNavLink} to="/progress" variant="filled" color="green" fullWidth rightSection="→" mt="auto" style={{ backgroundColor: '#1A2E3B', color: 'white' }}>
                See All
              </Button>
            </Card.Section>
          </Card>
        </SimpleGrid>
      </Container>
    </div>
  );
}
