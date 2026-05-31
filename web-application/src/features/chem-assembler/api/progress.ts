export type MoleculeProgress = {
  level1Builds: number;
  level2Builds: number;
  level3Builds: number;
  updatedAt: string | null;
};

export type DiagnosticResult = {
  recommendedGroup: 1 | 2 | 3;
  completedAt: string;
};

export type ProgressStore = {
  molecules: Record<string, MoleculeProgress>;
  diagnostic?: DiagnosticResult;
};

export const MASTERED_BUILDS = 3;

export function getLevelBuilds(progress: ProgressStore | null, molecule: string, level: 1 | 2 | 3): number {
  const moleculeProgress = progress?.molecules[molecule];
  if (!moleculeProgress) return 0;
  const key = `level${level}Builds` as const;
  return Math.min(moleculeProgress[key] ?? 0, MASTERED_BUILDS);
}

export function isMoleculeMastered(progress: ProgressStore | null, molecule: string) {
  return (
    getLevelBuilds(progress, molecule, 1) >= MASTERED_BUILDS &&
    getLevelBuilds(progress, molecule, 2) >= MASTERED_BUILDS &&
    getLevelBuilds(progress, molecule, 3) >= MASTERED_BUILDS
  );
}

export async function fetchProgress(): Promise<ProgressStore> {
  const response = await fetch('/api/progress');
  if (!response.ok) throw new Error('Unable to load progress');
  return response.json();
}

export async function recordSuccessfulBuild(moleculeName: string, level: 1 | 2 | 3 = 1): Promise<MoleculeProgress> {
  const response = await fetch(`/api/progress/${encodeURIComponent(moleculeName)}/builds?level=${level}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Unable to save progress');
  return response.json();
}

export async function recordDiagnostic(recommendedGroup: 1 | 2 | 3): Promise<ProgressStore> {
  const response = await fetch('/api/progress/diagnostic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommendedGroup }),
  });
  if (!response.ok) throw new Error('Unable to save diagnostic');
  return response.json();
}

export async function resetProgress(): Promise<ProgressStore> {
  const response = await fetch('/api/progress', {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Unable to reset progress');
  return response.json();
}

export async function completeMasteries(moleculeNames: string[]): Promise<ProgressStore> {
  const response = await fetch('/api/progress/masteries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moleculeNames }),
  });
  if (!response.ok) throw new Error('Unable to complete masteries');
  return response.json();
}
