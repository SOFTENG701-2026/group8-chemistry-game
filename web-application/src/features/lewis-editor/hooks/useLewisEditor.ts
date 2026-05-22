import { useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type OnConnect,
  type OnEdgeClick,
  type NodeMouseHandler,
  type IsValidConnection,
} from '@xyflow/react';
import type { AtomNodeType } from '../components/AtomNode';
import type { BondEdgeType } from '../components/BondEdge';
import { ELEMENTS } from '../data/elements';
import type { BondOrder } from '@app/shared';

const uid = () => Math.random().toString(36).slice(2, 9);

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

  const cycleEdgeOrder: OnEdgeClick = useCallback(
    (_event, edge) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edge.id) return e;
          const current: BondOrder = e.data?.order ?? 1;
          const proposed: BondOrder = current === 3 ? 1 : ((current + 1) as BondOrder);
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
    selectedNode,
  };
}
