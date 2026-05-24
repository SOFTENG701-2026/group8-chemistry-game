import { Router } from 'express';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type MoleculeProgress = {
  level1Builds: number;
  level2Builds: number;
  level3Builds: number;
  updatedAt: string | null;
};

type LegacyMoleculeProgress = {
  successfulBuilds: number;
  updatedAt: string | null;
};

type ProgressStore = {
  molecules: Record<string, MoleculeProgress>;
};

const DATA_FILE = path.resolve(process.cwd(), 'data/progress.json');
const EMPTY_PROGRESS: MoleculeProgress = { level1Builds: 0, level2Builds: 0, level3Builds: 0, updatedAt: null };
const EMPTY_STORE: ProgressStore = { molecules: {} };

export const progressRouter: Router = Router();

function migrateMolecule(raw: unknown): MoleculeProgress {
  if (typeof raw !== 'object' || raw === null) return { ...EMPTY_PROGRESS };
  const r = raw as Partial<MoleculeProgress & LegacyMoleculeProgress>;
  if ('successfulBuilds' in r) {
    return {
      level1Builds: r.successfulBuilds ?? 0,
      level2Builds: 0,
      level3Builds: 0,
      updatedAt: r.updatedAt ?? null,
    };
  }
  return {
    level1Builds: r.level1Builds ?? 0,
    level2Builds: r.level2Builds ?? 0,
    level3Builds: r.level3Builds ?? 0,
    updatedAt: r.updatedAt ?? null,
  };
}

async function readProgress(): Promise<ProgressStore> {
  try {
    const data = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data) as { molecules?: Record<string, unknown> };
    const molecules: Record<string, MoleculeProgress> = {};
    for (const [name, value] of Object.entries(parsed.molecules ?? {})) {
      molecules[name] = migrateMolecule(value);
    }
    return { molecules };
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
      store.molecules[moleculeName] = { level1Builds: 3, level2Builds: 3, level3Builds: 3, updatedAt };
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
    const levelParam = Number(req.query.level ?? 1);
    const level = (levelParam === 1 || levelParam === 2 || levelParam === 3) ? levelParam : 1;
    const field = (`level${level}Builds`) as keyof Pick<MoleculeProgress, 'level1Builds' | 'level2Builds' | 'level3Builds'>;

    const store = await readProgress();
    const current = store.molecules[moleculeName] ?? { ...EMPTY_PROGRESS };

    const updated: MoleculeProgress = {
      ...current,
      [field]: Math.min((current[field] ?? 0) + 1, 3),
      updatedAt: new Date().toISOString(),
    };

    store.molecules[moleculeName] = updated;
    await writeProgress(store);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});
