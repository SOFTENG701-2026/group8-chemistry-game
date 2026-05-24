import { ELEMENTS } from '../data/elements';
import type { AtomNodeType } from '../components/AtomNode';
import type { BondEdgeType } from '../components/BondEdge';

export function hillFormula(nodes: AtomNodeType[]): string {
  if (nodes.length === 0) return '';
  const counts: Record<string, number> = {};
  for (const n of nodes) {
    const el = n.data.element;
    counts[el] = (counts[el] ?? 0) + 1;
  }
  const parts: string[] = [];
  if (counts['C']) parts.push(`C${counts['C'] > 1 ? counts['C'] : ''}`);
  if (counts['H']) parts.push(`H${counts['H'] > 1 ? counts['H'] : ''}`);
  for (const el of Object.keys(counts).sort()) {
    if (el !== 'C' && el !== 'H') parts.push(`${el}${counts[el] > 1 ? counts[el] : ''}`);
  }
  return parts.join('');
}

export function isConnected(nodes: AtomNodeType[], edges: BondEdgeType[]): boolean {
  if (nodes.length === 0) return false;
  if (nodes.length === 1) return true;

  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n.id, new Set());
  for (const e of edges) {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  }

  const visited = new Set<string>();
  const queue = [nodes[0].id];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const neighbour of adj.get(id) ?? []) {
      if (!visited.has(neighbour)) queue.push(neighbour);
    }
  }
  return visited.size === nodes.length;
}

export function allValencesSatisfied(nodes: AtomNodeType[], edges: BondEdgeType[]): boolean {
  for (const node of nodes) {
    const valence = ELEMENTS[node.data.element]?.valence;
    if (valence === undefined) continue;
    const used = edges.reduce((sum, e) => {
      if (e.source === node.id || e.target === node.id) return sum + (e.data?.order ?? 1);
      return sum;
    }, 0);
    if (used !== valence) return false;
  }
  return true;
}
