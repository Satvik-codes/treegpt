import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow, ReactFlowProvider,
  type Node, type Edge, BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTreeStore, type ChatMessage } from '@/stores/tree-store';
import TreeNodeComponent from './TreeNode';
import dagre from '@dagrejs/dagre';
import gsap from 'gsap';

const nodeTypes = { treeNode: TreeNodeComponent };

function layoutNodes(rawNodes: Node[], rawEdges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 160 });

  rawNodes.forEach((node) => g.setNode(node.id, { width: 240, height: 100 }));
  rawEdges.forEach((edge) => g.setEdge(edge.source, edge.target));
  dagre.layout(g);

  return rawNodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - 120, y: pos.y - 50 } };
  });
}

function GraphCanvasInner() {
  const { nodes: treeNodes, selectedNodeId, setSelectedNode } = useTreeStore();
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<Node>([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const buildGraph = useCallback(() => {
    const messages = (msgs: unknown): ChatMessage[] => (msgs as ChatMessage[]) || [];
    const lastMsg = (msgs: unknown) => {
      const arr = messages(msgs);
      return arr.length > 0 ? arr[arr.length - 1].content : '';
    };

    const nodes: Node[] = treeNodes.map((n) => {
      // Use stored positions if available and non-zero
      const hasStoredPos = (n.position_x !== null && n.position_x !== undefined) ||
                           (n.position_y !== null && n.position_y !== undefined);
      return {
        id: n.id,
        type: 'treeNode',
        position: hasStoredPos ? { x: n.position_x || 0, y: n.position_y || 0 } : { x: 0, y: 0 },
        data: {
          label: lastMsg(n.messages),
          status: n.status,
          role: n.role,
          isSelected: n.id === selectedNodeId,
          isExpanded: n.is_expanded,
          summary: n.summary,
          messageCount: messages(n.messages).length,
          mode: n.mode,
        },
      };
    });

    const edges: Edge[] = treeNodes
      .filter((n) => n.parent_id)
      .map((n) => ({
        id: `${n.parent_id}-${n.id}`,
        source: n.parent_id!,
        target: n.id,
        animated: n.status === 'active',
        style: {
          stroke: n.status === 'failed' ? 'var(--node-failed)' : 'var(--muted-foreground)',
          strokeWidth: 2,
        },
      }));

    if (nodes.length > 0) {
      // Check if any node has no real stored position — if so, run layout
      const needsLayout = nodes.some(n => n.position.x === 0 && n.position.y === 0 && treeNodes.length > 1);
      const finalNodes = needsLayout ? layoutNodes(nodes, edges) : nodes;
      
      setFlowNodes(finalNodes);
      setFlowEdges(edges);

      // Only fitView when node count changes
      if (treeNodes.length !== prevCountRef.current) {
        prevCountRef.current = treeNodes.length;
        setTimeout(() => fitView({ padding: 0.3, duration: 600 }), 50);
      }
    } else {
      setFlowNodes([]);
      setFlowEdges([]);
      prevCountRef.current = 0;
    }
  }, [treeNodes, selectedNodeId, setFlowNodes, setFlowEdges, fitView]);

  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  // GSAP entrance for new nodes
  useEffect(() => {
    if (!containerRef.current) return;
    const newEls = containerRef.current.querySelectorAll('[data-new-node="true"]');
    if (newEls.length > 0) {
      gsap.fromTo(newEls, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.4)' });
    }
  }, [flowNodes]);

  const onNodeClick = useCallback(
    (_: any, node: Node) => setSelectedNode(node.id),
    [setSelectedNode],
  );

  return (
    <div ref={containerRef} className="h-full w-full bg-[var(--surface)]">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(229,226,225,0.28)"
          style={{ opacity: 0.18 }}
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const status = (n.data as any)?.status;
            if (status === 'failed') return 'var(--node-failed)';
            if (status === 'success') return 'var(--node-success)';
            return 'var(--node-active)';
          }}
          maskColor="rgba(19,19,19,0.70)"
        />
      </ReactFlow>
    </div>
  );
}

export default function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  );
}
