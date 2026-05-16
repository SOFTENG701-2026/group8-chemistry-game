import { useEffect, useState } from 'react';
import { Container, Title, Text, Card, Stack, Group, Badge, Anchor, Loader } from '@mantine/core';
import { Link } from 'react-router';
import type { Molecule, ApiError } from '@app/shared';

const API = 'http://localhost:3001';

export function Molecules() {
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/molecules`)
      .then((res) => {
        if (!res.ok) return res.json().then((e: ApiError) => Promise.reject(e.error));
        return res.json() as Promise<Molecule[]>;
      })
      .then(setMolecules)
      .catch((e: string) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container size="sm" pt={40}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Molecules</Title>
        <Anchor component={Link} to="/">← Home</Anchor>
      </Group>

      {loading && <Loader />}
      {error && <Text c="red">{error}</Text>}
      {!loading && !error && molecules.length === 0 && (
        <Text c="dimmed">No molecules saved yet.</Text>
      )}

      <Stack gap="sm">
        {molecules.map((m) => (
          <Card key={m.id} withBorder padding="md">
            <Group justify="space-between">
              <Text fw={500}>{m.name}</Text>
              <Group gap="xs">
                <Badge variant="light">{m.atoms.length} atoms</Badge>
                <Badge variant="light" color="grape">{m.bonds.length} bonds</Badge>
              </Group>
            </Group>
            <Text size="xs" c="dimmed" mt={4}>{m.id}</Text>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
