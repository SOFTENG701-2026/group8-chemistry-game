import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import type { Molecule } from '@app/shared';

const store = new Map<string, Molecule>();

const dummyId = randomUUID();
store.set(dummyId, {
  id: dummyId,
  name: 'Methane',
  atoms: [
    { id: 'C1', element: 'C', x: 0, y: 0 },
    { id: 'H1', element: 'H', x: 1, y: 0 },
    { id: 'H2', element: 'H', x: -1, y: 0 },
    { id: 'H3', element: 'H', x: 0, y: 1 },
    { id: 'H4', element: 'H', x: 0, y: -1 },
  ],
  bonds: [
    { from: 'C1', to: 'H1', order: 1 },
    { from: 'C1', to: 'H2', order: 1 },
    { from: 'C1', to: 'H3', order: 1 },
    { from: 'C1', to: 'H4', order: 1 },
  ],
});

export const moleculesRouter: Router = Router();

moleculesRouter.get('/', (_req, res) => {
  res.json([...store.values()]);
});

moleculesRouter.get('/:id', (req, res) => {
  const m = store.get(req.params.id);
  if (!m) return res.status(404).json({ error: 'not found' });
  res.json(m);
});

moleculesRouter.post('/', (req, res) => {
  const molecule: Molecule = { id: randomUUID(), ...req.body };
  store.set(molecule.id, molecule);
  res.status(201).json(molecule);
});

moleculesRouter.delete('/:id', (req, res) => {
  const existed = store.delete(req.params.id);
  res.status(existed ? 204 : 404).end();
});
