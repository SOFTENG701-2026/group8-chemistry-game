export type MoleculeProgress = {
  successfulBuilds: number;
  updatedAt: string | null;
};

export type ProgressStore = {
  molecules: Record<string, MoleculeProgress>;
};

export async function fetchProgress(): Promise<ProgressStore> {
  const response = await fetch('/api/progress');
  if (!response.ok) throw new Error('Unable to load progress');
  return response.json();
}

export async function recordSuccessfulBuild(moleculeName: string): Promise<MoleculeProgress> {
  const response = await fetch(`/api/progress/${encodeURIComponent(moleculeName)}/builds`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Unable to save progress');
  return response.json();
}
