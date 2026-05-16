import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import { useNavigate } from 'react-router';

export function Home() {
  const navigate = useNavigate();

  return (
    <Container size="sm" pt={80}>
      <Stack align="center" gap="lg">
        <Title order={1}>Molecule Builder</Title>
        <Text c="dimmed" ta="center">
          Build and explore organic chemistry structures using a drag-and-drop canvas.
        </Text>
        <Group>
          <Button size="md" onClick={() => navigate('/molecules')}>
            View Molecules
          </Button>
          <Button size="md" variant="outline" onClick={() => navigate('/chem-assembler')}>
            Chem Assembler
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
