import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { ELEMENTS } from '../data/elements';

export type AtomNodeData = {
  element: string;
  isPreviewed?: boolean;
};

export type AtomNodeType = Node<AtomNodeData, 'atom'>;

const HANDLE_COUNT = 20;
const HANDLE_SIZE = 12;
const ATOM_SIZE = 44;
const ATOM_RADIUS = ATOM_SIZE / 2;
const HANDLE_RADIUS = ATOM_RADIUS + 1;

const perimeterHandles = Array.from({ length: HANDLE_COUNT }, (_, index) => {
  const angle = (index / HANDLE_COUNT) * Math.PI * 2;
  return {
    id: `edge-${index}`,
    x: ATOM_RADIUS + Math.cos(angle) * HANDLE_RADIUS,
    y: ATOM_RADIUS + Math.sin(angle) * HANDLE_RADIUS,
    position:
      Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
        ? Math.cos(angle) > 0 ? Position.Right : Position.Left
        : Math.sin(angle) > 0 ? Position.Bottom : Position.Top,
  };
});

const handleStyle = (x: number, y: number): React.CSSProperties => ({
  width: HANDLE_SIZE,
  height: HANDLE_SIZE,
  left: x,
  top: y,
  background: 'transparent',
  border: 'none',
  borderRadius: '50%',
  opacity: 1,
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
});

const targetHandleStyle: React.CSSProperties = {
  width: ATOM_SIZE,
  height: ATOM_SIZE,
  left: ATOM_RADIUS,
  top: ATOM_RADIUS,
  background: 'transparent',
  border: 'none',
  borderRadius: '50%',
  opacity: 1,
  transform: 'translate(-50%, -50%)',
  zIndex: 5,
};

export function AtomNode({ data, selected }: NodeProps<AtomNodeType>) {
  const info = ELEMENTS[data.element];
  const bg = info?.bg ?? '#EFF3F6';
  const border = info?.border ?? '#A8BEC9';
  const fontSize = data.element.length > 1 ? '0.72rem' : '1rem';
  const boxShadow = data.isPreviewed
    ? '0 0 0 3px rgba(226,96,63,0.25), 0 0 0 7px rgba(61,117,48,0.32), 0 0 18px rgba(61,117,48,0.45)'
    : selected
      ? '0 0 0 3px rgba(226,96,63,0.25)'
      : '0 2px 6px rgba(0,0,0,0.12)';

  return (
    <div
      className="lewis-atom-node"
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: bg,
        border: `2.5px solid ${selected ? '#E2603F' : border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontWeight: 700,
        fontSize,
        color: '#1A2E3B',
        boxShadow,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      <Handle
        id="atom-target"
        className="lewis-atom-target"
        type="target"
        position={Position.Top}
        isConnectableStart={false}
        isConnectableEnd
        style={targetHandleStyle}
      />
      {perimeterHandles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          className="lewis-atom-source"
          type="source"
          position={handle.position}
          isConnectableStart
          isConnectableEnd={false}
          style={handleStyle(handle.x, handle.y)}
        />
      ))}
      {data.element}
    </div>
  );
}
