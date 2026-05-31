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
