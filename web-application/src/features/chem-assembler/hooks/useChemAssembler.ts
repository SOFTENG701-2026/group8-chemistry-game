import { useState, useEffect, useMemo } from 'react';
import type { DragEvent } from 'react';
import { useSearchParams } from 'react-router';
import type { CardInstance, Feedback, DragSource } from '../types';
import { PROBLEMS } from '../data/problems';
import { CARD_DEF } from '../data/cards';
import { recordSuccessfulBuild } from '../api/progress';

const uid = () => Math.random().toString(36).slice(2, 9);

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

function getMatchingProblemName(cardKeys: string[]) {
  if (cardKeys.length === 0) return null;

  const match = PROBLEMS.find((candidate) =>
    arraysEqual(cardKeys, candidate.correct) ||
    (candidate.symmetric === true && arraysEqual(cardKeys, [...candidate.correct].reverse())),
  );

  return match?.name ?? null;
}

function buildCards(idx: number): CardInstance[] {
  const p = PROBLEMS[idx];
  const keys = [...p.correct, ...p.extras];
  const cards: CardInstance[] = keys.map((k) => ({ key: k, instanceId: uid() }));
  for (let j = cards.length - 1; j > 0; j--) {
    const r = Math.floor(Math.random() * (j + 1));
    [cards[j], cards[r]] = [cards[r], cards[j]];
  }
  return cards;
}

function buildSandboxCards(): CardInstance[] {
  return Object.keys(CARD_DEF).map(k => ({ key: k, instanceId: uid() }));
}

export function useChemAssembler() {
  const [searchParams] = useSearchParams();
  const moleculeQuery = searchParams.get('molecule');
  
  const foundIdx = moleculeQuery ? PROBLEMS.findIndex(p => p.name === moleculeQuery) : -1;
  const isSandbox = foundIdx === -1;

  const [idx, setIdx] = useState(isSandbox ? 0 : foundIdx);
  const [resetKey, setResetKey] = useState(0);
  const [pool, setPool] = useState<CardInstance[]>(() => isSandbox ? buildSandboxCards() : buildCards(isSandbox ? 0 : foundIdx));
  const [built, setBuilt] = useState<CardInstance[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const problem = isSandbox ? null : PROBLEMS[idx];

  useEffect(() => {
    if (isSandbox) {
      setPool(buildSandboxCards());
    } else {
      setPool(buildCards(idx));
    }
    setBuilt([]);
    setFeedback(null);
    setHintLevel(0);
  }, [idx, isSandbox, resetKey]);

  // Sync idx when the URL's molecule param changes (not when next/prev mutate idx locally)
  useEffect(() => {
    if (!isSandbox && foundIdx !== -1) {
      setIdx(foundIdx);
    }
    // Intentionally omitting idx — we only want to sync on URL changes, not local navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundIdx, isSandbox]);

  function moveToBuild(instanceId: string) {
    const card = pool.find((c) => c.instanceId === instanceId);
    if (!card) return;
    
    if (isSandbox) {
      // Replace the card in the pool so it acts as an infinite supply
      setPool([...pool.filter((c) => c.instanceId !== instanceId), { key: card.key, instanceId: uid() }]);
    } else {
      setPool(pool.filter((c) => c.instanceId !== instanceId));
    }
    
    setBuilt([...built, card]);
    setFeedback(null);
  }

  function moveToPool(instanceId: string) {
    const card = built.find((c) => c.instanceId === instanceId);
    if (!card) return;
    setBuilt(built.filter((c) => c.instanceId !== instanceId));
    
    if (!isSandbox) {
      setPool([...pool, card]);
    }
    setFeedback(null);
  }

  function onDragStart(e: DragEvent<HTMLElement>, instanceId: string, source: DragSource) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ instanceId, source }));
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDropBuild(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    try {
      const { instanceId, source } = JSON.parse(e.dataTransfer.getData('text/plain')) as { instanceId: string; source: DragSource };
      if (source === 'pool') moveToBuild(instanceId);
    } catch { /* ignore malformed drag data */ }
  }

  function onDropPool(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    try {
      const { instanceId, source } = JSON.parse(e.dataTransfer.getData('text/plain')) as { instanceId: string; source: DragSource };
      if (source === 'build') moveToPool(instanceId);
    } catch { /* ignore malformed drag data */ }
  }

  function check() {
    if (built.length === 0 || isSandbox || !problem) return;
    const seq = built.map((c) => c.key);
    const ok =
      arraysEqual(seq, problem.correct) ||
      (problem.symmetric === true && arraysEqual(seq, [...problem.correct].reverse()));
    if (ok) {
      setFeedback('right');
      setStreak((s) => s + 1);
      setSolved((current) => new Set([...current, idx]));
      void recordSuccessfulBuild(problem.name).catch((error) => {
        console.error('Failed to save progress', error);
      });
    } else {
      setFeedback('wrong');
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function next() {
    if (!isSandbox) setIdx((i) => (i + 1) % PROBLEMS.length);
  }

  function prev() {
    if (!isSandbox) setIdx((i) => (i - 1 + PROBLEMS.length) % PROBLEMS.length);
  }

  function reset() {
    setResetKey((k) => k + 1);
  }

  function giveHint() {
    setHintLevel((h) => Math.min(h + 1, 2));
  }

  const assembledFormula = useMemo(
    () => built.map((c) => CARD_DEF[c.key].display).join('').replace(/—/g, ''),
    [built],
  );

  const assembledMoleculeName = useMemo(
    () => getMatchingProblemName(built.map((c) => c.key)),
    [built],
  );

  return {
    isSandbox, idx, problem, pool, built, feedback, streak,
    solved, shake, hintLevel, assembledFormula, assembledMoleculeName,
    progress: solved.size,
    moveToBuild, moveToPool,
    onDragStart, onDragOver, onDropBuild, onDropPool,
    check, next, prev, reset, giveHint,
  };
}
