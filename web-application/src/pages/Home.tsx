import { Container, Title, Text, Button, Stack } from '@mantine/core';
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
        <Button size="md" onClick={() => navigate('/molecules')}>
          View Molecules
        </Button>
      </Stack>
    </Container>
  );
}
