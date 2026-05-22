import { getStraightPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { BondOrder } from '@app/shared';

export type BondEdgeData = { order: BondOrder };
export type BondEdgeType = Edge<BondEdgeData, 'bond'>;

export function BondEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<BondEdgeType>) {
  const order: BondOrder = data?.order ?? 1;

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector for offsetting parallel lines
  const px = (-dy / len) * 5;
  const py = (dx / len) * 5;

  const offsets: number[] =
    order === 1 ? [0] : order === 2 ? [-0.5, 0.5] : [-1, 0, 1];

  const stroke = selected ? '#E2603F' : '#1A2E3B';

  const [centerPath] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  return (
    <g>
      {/* Wide invisible path so the edge is easy to click */}
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
          sourceX: sourceX + px * o,
          sourceY: sourceY + py * o,
          targetX: targetX + px * o,
          targetY: targetY + py * o,
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
