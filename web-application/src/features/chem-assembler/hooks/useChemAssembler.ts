import { useState, useEffect, useMemo } from 'react';
import type { DragEvent } from 'react';
import type { CardInstance, Feedback, DragSource } from '../types';
import { PROBLEMS } from '../data/problems';
import { CARD_DEF } from '../data/cards';

const uid = () => Math.random().toString(36).slice(2, 9);

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

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

export function useChemAssembler() {
  const [idx, setIdx] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [pool, setPool] = useState<CardInstance[]>(() => buildCards(0));
  const [built, setBuilt] = useState<CardInstance[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const problem = PROBLEMS[idx];

  useEffect(() => {
    setPool(buildCards(idx));
    setBuilt([]);
    setFeedback(null);
    setHintLevel(0);
  }, [idx, resetKey]);

  function moveToBuild(instanceId: string) {
    const card = pool.find((c) => c.instanceId === instanceId);
    if (!card) return;
    setPool(pool.filter((c) => c.instanceId !== instanceId));
    setBuilt([...built, card]);
    setFeedback(null);
  }

  function moveToPool(instanceId: string) {
    const card = built.find((c) => c.instanceId === instanceId);
    if (!card) return;
    setBuilt(built.filter((c) => c.instanceId !== instanceId));
    setPool([...pool, card]);
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
    if (built.length === 0) return;
    const seq = built.map((c) => c.key);
    const ok =
      arraysEqual(seq, problem.correct) ||
      (problem.symmetric === true && arraysEqual(seq, [...problem.correct].reverse()));
    if (ok) {
      setFeedback('right');
      setStreak((s) => s + 1);
      setSolved(new Set([...solved, idx]));
    } else {
      setFeedback('wrong');
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function next() {
    setIdx((i) => (i + 1) % PROBLEMS.length);
  }

  function prev() {
    setIdx((i) => (i - 1 + PROBLEMS.length) % PROBLEMS.length);
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

  return {
    idx, problem, pool, built, feedback, streak,
    solved, shake, hintLevel, assembledFormula,
    progress: solved.size,
    moveToBuild, moveToPool,
    onDragStart, onDragOver, onDropBuild, onDropPool,
    check, next, prev, reset, giveHint,
  };
}
