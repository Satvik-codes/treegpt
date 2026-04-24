import type { Database } from '@/integrations/supabase/types';

type NodeRow = Database['public']['Tables']['nodes']['Row'];

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function getNodeMessages(node: NodeRow): ChatMessage[] {
  return (node.messages as unknown as ChatMessage[]) || [];
}

export function buildContextMessages(nodes: NodeRow[], currentNodeId: string): ChatMessage[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const path: NodeRow[] = [];

  let current = nodeMap.get(currentNodeId);
  while (current) {
    path.unshift(current);
    current = current.parent_id ? nodeMap.get(current.parent_id) : undefined;
  }

  // Build context: parent summaries + current node messages
  const contextMessages: ChatMessage[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const node = path[i];
    const summary = node.summary || getNodeMessages(node).map(m => `${m.role}: ${m.content}`).join('\n');
    contextMessages.push({ role: 'user', content: `[Context] ${summary}` });
  }

  const currentNode = path[path.length - 1];
  if (currentNode) {
    contextMessages.push(...getNodeMessages(currentNode));
  }

  return contextMessages;
}
