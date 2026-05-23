import { useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type OnConnect,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  type IsValidConnection,
} from '@xyflow/react';
import type { AtomNodeType } from '../components/AtomNode';
import type { BondEdgeType } from '../components/BondEdge';
import { ELEMENTS } from '../data/elements';
import type { BondOrder } from '@app/shared';

const uid = () => Math.random().toString(36).slice(2, 9);
const ATOM_NODE_SIZE = 44;

type ScreenRect = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function usedBonds(nodeId: string, edgeList: BondEdgeType[], excludeEdgeId?: string): number {
  return edgeList.reduce((sum, e) => {
    if (e.id === excludeEdgeId) return sum;
    if (e.source === nodeId || e.target === nodeId) return sum + (e.data?.order ?? 1);
    return sum;
  }, 0);
}

function valenceOf(nodeId: string, nodeList: AtomNodeType[]): number {
  const node = nodeList.find((n) => n.id === nodeId);
  const element = node?.data.element;
  return element ? (ELEMENTS[element]?.valence ?? Infinity) : Infinity;
}

export function useLewisEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AtomNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BondEdgeType>([]);
  const { screenToFlowPosition } = useReactFlow();

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => {
      if (connection.source === connection.target) return false;
      const sourceUsed = usedBonds(connection.source, edges as BondEdgeType[]);
      const targetUsed = usedBonds(connection.target, edges as BondEdgeType[]);
      return (
        sourceUsed < valenceOf(connection.source, nodes as AtomNodeType[]) &&
        targetUsed < valenceOf(connection.target, nodes as AtomNodeType[])
      );
    },
    [nodes, edges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge<BondEdgeType>(
          { ...connection, type: 'bond', data: { order: 1 } },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const cycleEdgeOrder: EdgeMouseHandler<BondEdgeType> = useCallback(
    (_event, edge) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edge.id) return e;
          const current: BondOrder = e.data?.order ?? 1;
          const proposed: BondOrder = current === 2 ? 1 : 2;
          // Only need to validate increases; decreasing to 1 is always safe
          if (proposed > current) {
            const typedEds = eds as BondEdgeType[];
            const typedNodes = nodes as AtomNodeType[];
            const srcFree = valenceOf(e.source, typedNodes) - usedBonds(e.source, typedEds, e.id);
            const tgtFree = valenceOf(e.target, typedNodes) - usedBonds(e.target, typedEds, e.id);
            if (proposed > srcFree || proposed > tgtFree) return e;
          }
          return { ...e, data: { order: proposed } };
        }),
      );
    },
    [setEdges, nodes],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const element = event.dataTransfer.getData('application/lewis-atom');
      if (!element) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode: AtomNodeType = {
        id: uid(),
        type: 'atom',
        position,
        data: { element },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const deleteSelected: NodeMouseHandler = useCallback(() => {}, []);

  const selectNodesInScreenRect = useCallback(
    ({ x1, y1, x2, y2 }: ScreenRect) => {
      const start = screenToFlowPosition({ x: Math.min(x1, x2), y: Math.min(y1, y2) });
      const end = screenToFlowPosition({ x: Math.max(x1, x2), y: Math.max(y1, y2) });
      const left = Math.min(start.x, end.x);
      const right = Math.max(start.x, end.x);
      const top = Math.min(start.y, end.y);
      const bottom = Math.max(start.y, end.y);

      const selectedNodeIds = new Set<string>();
      for (const node of nodes as AtomNodeType[]) {
        const width = node.measured?.width ?? node.width ?? ATOM_NODE_SIZE;
        const height = node.measured?.height ?? node.height ?? ATOM_NODE_SIZE;
        const nodeLeft = node.position.x;
        const nodeRight = node.position.x + width;
        const nodeTop = node.position.y;
        const nodeBottom = node.position.y + height;
        const overlaps =
          nodeRight >= left &&
          nodeLeft <= right &&
          nodeBottom >= top &&
          nodeTop <= bottom;

        if (overlaps) selectedNodeIds.add(node.id);
      }

      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: selectedNodeIds.has(node.id),
        })),
      );
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          selected: selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target),
        })),
      );
    },
    [nodes, screenToFlowPosition, setEdges, setNodes],
  );

  function clearAll() {
    setNodes([]);
    setEdges([]);
  }

  function deleteSelectedElements() {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => {
      const remainingIds = new Set(
        nodes.filter((n) => !n.selected).map((n) => n.id),
      );
      return eds.filter(
        (e) => remainingIds.has(e.source) && remainingIds.has(e.target) && !e.selected,
      );
    });
  }

  const selectedNode = nodes.find((n) => n.selected) as AtomNodeType | undefined;

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    cycleEdgeOrder,
    onDrop,
    onDragOver,
    clearAll,
    deleteSelectedElements,
    deleteSelected,
    selectNodesInScreenRect,
    selectedNode,
  };
}
