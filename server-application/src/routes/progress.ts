import { Router } from 'express';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type MoleculeProgress = {
  successfulBuilds: number;
  updatedAt: string | null;
};

type ProgressStore = {
  molecules: Record<string, MoleculeProgress>;
};

const DATA_FILE = path.resolve(process.cwd(), 'data/progress.json');
const EMPTY_STORE: ProgressStore = { molecules: {} };

export const progressRouter: Router = Router();

async function readProgress(): Promise<ProgressStore> {
  try {
    const data = await readFile(DATA_FILE, 'utf8');
    return { ...EMPTY_STORE, ...JSON.parse(data) };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') throw error;
    await writeProgress(EMPTY_STORE);
    return EMPTY_STORE;
  }
}

async function writeProgress(store: ProgressStore) {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

progressRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await readProgress());
  } catch (error) {
    next(error);
  }
});

progressRouter.delete('/', async (_req, res, next) => {
  try {
    await writeProgress(EMPTY_STORE);
    res.json(EMPTY_STORE);
  } catch (error) {
    next(error);
  }
});

progressRouter.post('/masteries', async (req, res, next) => {
  try {
    const moleculeNames: string[] = Array.isArray(req.body?.moleculeNames)
      ? req.body.moleculeNames.filter((name: unknown): name is string => typeof name === 'string')
      : [];

    const store = await readProgress();
    const updatedAt = new Date().toISOString();

    moleculeNames.forEach((moleculeName) => {
      store.molecules[moleculeName] = {
        successfulBuilds: 3,
        updatedAt,
      };
    });

    await writeProgress(store);
    res.json(store);
  } catch (error) {
    next(error);
  }
});

progressRouter.post('/:moleculeName/builds', async (req, res, next) => {
  try {
    const moleculeName = decodeURIComponent(req.params.moleculeName);
    const store = await readProgress();
    const current = store.molecules[moleculeName] ?? {
      successfulBuilds: 0,
      updatedAt: null,
    };

    const updated: MoleculeProgress = {
      successfulBuilds: Math.min(current.successfulBuilds + 1, 3),
      updatedAt: new Date().toISOString(),
    };

    store.molecules[moleculeName] = updated;
    await writeProgress(store);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});
