import { create } from 'zustand';
import type { Database } from '@/integrations/supabase/types';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type NodeRow = Database['public']['Tables']['nodes']['Row'];
type NodeStatus = Database['public']['Enums']['node_status'];

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TreeState {
  conversations: Conversation[];
  currentConversationId: string | null;
  nodes: NodeRow[];
  selectedNodeId: string | null;
  isLoading: boolean;
  isGenerating: boolean;

  setConversations: (convs: Conversation[]) => void;
  setCurrentConversation: (id: string | null) => void;
  setNodes: (nodes: NodeRow[]) => void;
  addNode: (node: NodeRow) => void;
  updateNode: (nodeId: string, updates: Partial<NodeRow>) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  conversations: [] as Conversation[],
  currentConversationId: null,
  nodes: [] as NodeRow[],
  selectedNodeId: null,
  isLoading: false,
  isGenerating: false,

  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (id) => set({ currentConversationId: id, selectedNodeId: null }),
  setNodes: (nodes) => set({ nodes }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNode: (nodeId, updates) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    })),
  updateNodeStatus: (nodeId, status) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, status } : n)),
    })),
  removeNode: (nodeId) =>
    set((s) => {
      const toRemove = new Set<string>();
      const collect = (id: string) => {
        toRemove.add(id);
        s.nodes.filter((n) => n.parent_id === id).forEach((n) => collect(n.id));
      };
      collect(nodeId);
      return { nodes: s.nodes.filter((n) => !toRemove.has(n.id)) };
    }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));
