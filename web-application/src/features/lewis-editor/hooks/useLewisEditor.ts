import { useCallback, useEffect, useRef } from 'react';
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

const ATOM_NODE_SIZE = 44;

type ScreenRect = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DragOffset = {
  x: number;
  y: number;
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

function getDragOffset(event: React.DragEvent<HTMLDivElement>): DragOffset {
  try {
    const rawOffset = event.dataTransfer.getData('application/lewis-atom-offset');
    if (!rawOffset) throw new Error('Missing atom drag offset');
    const offset = JSON.parse(rawOffset) as Partial<DragOffset>;

    return {
      x: typeof offset.x === 'number' ? offset.x : ATOM_NODE_SIZE / 2,
      y: typeof offset.y === 'number' ? offset.y : ATOM_NODE_SIZE / 2,
    };
  } catch {
    return { x: ATOM_NODE_SIZE / 2, y: ATOM_NODE_SIZE / 2 };
  }
}

export function useLewisEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AtomNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BondEdgeType>([]);
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const nextAtomId = useRef(0);

  // Drop any edge whose endpoint atom no longer exists, so the bond counts and
  // valence checks never report a bond that BondEdge can't draw. Returning the
  // same array reference when nothing changes keeps this from looping.
  useEffect(() => {
    setEdges((eds) => {
      const ids = new Set(nodes.map((n) => n.id));
      const pruned = eds.filter((e) => ids.has(e.source) && ids.has(e.target));
      return pruned.length === eds.length ? eds : pruned;
    });
  }, [nodes, setEdges]);

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
      if (connection.source === connection.target) return;
      setEdges((eds) => {
        // Re-check valence against the freshest edge list so rapid drags can't
        // push an atom past its valence (isValidConnection sees a stale snapshot).
        const typedEds = eds as BondEdgeType[];
        const typedNodes = nodes as AtomNodeType[];
        const srcFull = usedBonds(connection.source, typedEds) >= valenceOf(connection.source, typedNodes);
        const tgtFull = usedBonds(connection.target, typedEds) >= valenceOf(connection.target, typedNodes);
        if (srcFull || tgtFull) return eds;
        return addEdge<BondEdgeType>(
          { ...connection, type: 'bond', data: { order: 1 } },
          eds,
        );
      });
    },
    [setEdges, nodes],
  );

  const toggleSelectedEdgeOrder = useCallback(
    (edgeId: string) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edgeId) return e;
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

  const selectOrCycleEdgeOrder: EdgeMouseHandler<BondEdgeType> = useCallback(
    (event, edge) => {
      event.stopPropagation();

      if (edge.selected) {
        toggleSelectedEdgeOrder(edge.id);
        return;
      }

      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: false,
        })),
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id,
        })),
      );
    },
    [setEdges, setNodes, toggleSelectedEdgeOrder],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const element = event.dataTransfer.getData('application/lewis-atom');
      if (!element) return;
      const offset = getDragOffset(event);
      const position = screenToFlowPosition({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
      const newNode: AtomNodeType = {
        id: `atom-${nextAtomId.current++}`,
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

  const selectOnlyNode: NodeMouseHandler<AtomNodeType> = useCallback(
    (_event, clickedNode) => {
      const selectedCount = nodes.filter((node) => node.selected).length;
      if (selectedCount <= 1 || !clickedNode.selected) return;

      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === clickedNode.id,
        })),
      );
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          selected: false,
        })),
      );
    },
    [nodes, setEdges, setNodes],
  );

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
    // deleteElements atomically removes the selected nodes, their connected
    // edges, and any selected edges — so no orphan edge is ever left behind.
    void deleteElements({
      nodes: nodes.filter((n) => n.selected),
      edges: edges.filter((e) => e.selected),
    });
  }

  const selectedNodes = nodes.filter((n) => n.selected) as AtomNodeType[];

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    selectOrCycleEdgeOrder,
    onDrop,
    onDragOver,
    clearAll,
    deleteSelectedElements,
    deleteSelected,
    selectOnlyNode,
    selectNodesInScreenRect,
    selectedNodes,
  };
}
