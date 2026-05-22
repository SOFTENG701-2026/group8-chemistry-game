import { useNodes, getStraightPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { BondOrder } from '@app/shared';

export type BondEdgeData = { order: BondOrder };
export type BondEdgeType = Edge<BondEdgeData, 'bond'>;

const ATOM_RADIUS = 22; // half of the 44px atom node diameter

export function BondEdge({ id, source, target, data, selected }: EdgeProps<BondEdgeType>) {
  const nodes = useNodes();

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) return null;

  // Compute node centers from top-left positions
  const sx = sourceNode.position.x + ATOM_RADIUS;
  const sy = sourceNode.position.y + ATOM_RADIUS;
  const tx = targetNode.position.x + ATOM_RADIUS;
  const ty = targetNode.position.y + ATOM_RADIUS;

  const order: BondOrder = data?.order ?? 1;

  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector for parallel-line offsets
  const px = (-dy / len) * 5;
  const py = (dx / len) * 5;

  const offsets: number[] =
    order === 1 ? [0] : order === 2 ? [-0.5, 0.5] : [-1, 0, 1];

  const stroke = selected ? '#E2603F' : '#1A2E3B';
  const [centerPath] = getStraightPath({ sourceX: sx, sourceY: sy, targetX: tx, targetY: ty });

  return (
    <g>
      {/* Wide invisible path for click detection */}
      <path
        id={`${id}-hit`}
        d={centerPath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
        style={{ cursor: 'pointer' }}
      />
      {offsets.map((o, i) => {
        const [path] = getStraightPath({
          sourceX: sx + px * o,
          sourceY: sy + py * o,
          targetX: tx + px * o,
          targetY: ty + py * o,
        });
        return (
          <path
            key={i}
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
    </g>
  );
}
