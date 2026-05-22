import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { ELEMENTS } from '../data/elements';

export type AtomNodeData = {
  element: string;
};

export type AtomNodeType = Node<AtomNodeData, 'atom'>;

const handleStyle = (border: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  background: 'white',
  border: `2px solid ${border}`,
  borderRadius: '50%',
  opacity: 0,
  transition: 'opacity 0.15s',
  zIndex: 10,
});

export function AtomNode({ data, selected }: NodeProps<AtomNodeType>) {
  const info = ELEMENTS[data.element];
  const bg = info?.bg ?? '#EFF3F6';
  const border = info?.border ?? '#A8BEC9';
  const fontSize = data.element.length > 1 ? '0.72rem' : '1rem';

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
        boxShadow: selected
          ? '0 0 0 3px rgba(226,96,63,0.25)'
          : '0 2px 6px rgba(0,0,0,0.12)',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      <Handle id="t" type="source" position={Position.Top}    style={handleStyle(border)} />
      <Handle id="r" type="source" position={Position.Right}  style={handleStyle(border)} />
      <Handle id="b" type="source" position={Position.Bottom} style={handleStyle(border)} />
      <Handle id="l" type="source" position={Position.Left}   style={handleStyle(border)} />
      {data.element}
    </div>
  );
}
