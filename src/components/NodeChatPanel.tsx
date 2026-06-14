import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, CheckCircle2, XCircle, Trash2, Skull,
  ChevronDown, ChevronUp, GitBranch, MessageSquare, Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTreeStore, type ChatMessage } from '@/stores/tree-store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

async function invokeWithRetry(functionName: string, options: any, maxRetries = 1, delayMs = 2500) {
  let result: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    result = await supabase.functions.invoke(functionName, options);
    const isRateLimited = result.error?.status === 429 || 
                          result.error?.message?.includes('429') || 
                          result.error?.message?.includes('Rate limited') ||
                          (result.data && result.data.error && String(result.data.error).includes('Rate limited'));
                          
    if (isRateLimited && attempt < maxRetries) {
      console.warn(`Rate limited on ${functionName}. Retrying in ${delayMs}ms... (Attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delayMs));
      continue;
    }
    break;
  }
  return result;
}

type NodeStatus = Database['public']['Enums']['node_status'];
type NodeRow = Database['public']['Tables']['nodes']['Row'];

export default function NodeChatPanel() {
  const {
    nodes, selectedNodeId, currentConversationId, isGenerating,
    setIsGenerating, addNode, updateNode, updateNodeStatus,
    setSelectedNode, setNodes,
  } = useTreeStore();

  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const messages: ChatMessage[] = selectedNode
    ? (selectedNode.messages as unknown as ChatMessage[]) || []
    : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Normalize AI output to be structured and *not* show markdown bullets/stars.
  // Also makes headings/subheadings renderable by our message renderer.
  function normalizeAiText(input: string): string {
    const lines = input.replace(/\r\n/g, '\n').split('\n');

    // 1) Remove leading markdown bullet stars like: "* item" or "- item"
    // We keep numbering when present.
    const stripped = lines.map((l) => l.replace(/^\s*[\*\-]\s+/, ''));

    // 2) Convert markdown headers (#, ##, ###) into plain tokens we can style.
    const headerized = stripped.map((l) => {
      const m = l.match(/^\s*(#{1,6})\s+(.*)$/);
      if (!m) return l;
      const level = m[1].length;
      const text = (m[2] || '').trim();
      if (!text) return '';
      if (level <= 2) return `H1: ${text}`;
      if (level <= 4) return `H2: ${text}`;
      return `H3: ${text}`;
    });

    // 3) Collapse excessive empty lines
    const out: string[] = [];
    for (const l of headerized) {
      const prev = out[out.length - 1] ?? '';
      if (l.trim() === '' && prev.trim() === '') continue;
      out.push(l);
    }

    return out.join('\n').trim();
  }

  function getNodeMessages(node: NodeRow): ChatMessage[] {
    return (node.messages as unknown as ChatMessage[]) || [];
  }

  function StructuredMessage({ content }: { content: string }) {
    // Render our normalizeAiText() tokens.
    const lines = content.replace(/\r\n/g, '\n').split('\n');

    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const t = line.trim();
          if (!t) return <div key={idx} className="h-2" />;

          if (t.startsWith('H1: ')) {
            return (
              <div key={idx} className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--on_surface)]">
                {t.slice(4)}
              </div>
            );
          }

          if (t.startsWith('H2: ')) {
            return (
              <div key={idx} className="text-[13px] font-medium tracking-[-0.005em] text-[var(--on_surface)]">
                {t.slice(4)}
              </div>
            );
          }

          if (t.startsWith('H3: ')) {
            return (
              <div key={idx} className="text-[12px] font-medium text-[var(--on_surface_muted)] uppercase tracking-[0.05em]">
                {t.slice(4)}
              </div>
            );
          }

          return (
            <div key={idx} className="text-[13px] leading-relaxed text-[var(--on_surface)]">
              {line}
            </div>
          );
        })}
      </div>
    );
  }

  // Build context from current node + parent summaries
  function buildChatContext(): ChatMessage[] {
    if (!selectedNode) return [];
    const parentSummaries: string[] = [];
    let current = selectedNode;
    let depth = 0;
    while (current.parent_id && depth < 4) {
      const parent = nodes.find((n) => n.id === current.parent_id);
      if (!parent) break;
      let pSummary = parent.summary;
      if (!pSummary) {
        const rawText = getNodeMessages(parent).map(m => `${m.role}: ${m.content}`).join('\n');
        pSummary = rawText.length > 800 ? rawText.slice(0, 800) + '\n... (truncated)' : rawText;
      }
      parentSummaries.unshift(pSummary);
      current = parent;
      depth++;
    }
    const contextMessages: ChatMessage[] = [];
    if (parentSummaries.length > 0) {
      contextMessages.push({
        role: 'user',
        content: `[Context from parent nodes]\n${parentSummaries.join('\n---\n')}`,
      });
    }
    return [...contextMessages, ...messages];
  }

  // Generate a smart title for the conversation from the first user message
  async function generateConversationTitle(firstMessage: string) {
    if (!currentConversationId) return;
    
    // Add a 3-second delay to allow rate-limits to cool off, 
    // since this is often called right after a chat response is fired.
    await new Promise(r => setTimeout(r, 3000));
    
    try {
      const { data, error } = await invokeWithRetry('generate-response', {
        body: {
          mode: 'summarize',
          messages: [{ role: 'user', content: firstMessage }],
        },
      });
      const title = (!error && data?.summary) ? data.summary : firstMessage.slice(0, 60);
      await supabase.from('conversations').update({ title }).eq('id', currentConversationId);
      const state = useTreeStore.getState();
      state.setConversations(
        state.conversations.map(c => c.id === currentConversationId ? { ...c, title } : c)
      );
    } catch {
      // Fallback: use raw message as title
      const title = firstMessage.slice(0, 60);
      await supabase.from('conversations').update({ title }).eq('id', currentConversationId);
      const state = useTreeStore.getState();
      state.setConversations(
        state.conversations.map(c => c.id === currentConversationId ? { ...c, title } : c)
      );
    }
  }

  // Calculate position for a new child node
  function calcChildPosition(parentId: string): { x: number; y: number } {
    const parent = nodes.find(n => n.id === parentId);
    const siblings = nodes.filter(n => n.parent_id === parentId);
    const px = parent?.position_x || 0;
    const py = parent?.position_y || 0;
    const sibCount = siblings.length;
    const spacing = 320;
    const x = px + (sibCount - Math.floor(sibCount / 2)) * spacing;
    const y = py + 200;
    return { x, y };
  }

  async function handleSendMessage() {
    if (!userInput.trim() || !selectedNodeId || !currentConversationId || !selectedNode) return;
    const needsTitle = useTreeStore.getState().conversations.find(c => c.id === currentConversationId)?.title === 'New Conversation';
    const trimmedInput = userInput.trim();
    const newMsg: ChatMessage = { role: 'user', content: trimmedInput };
    const updatedMessages = [...messages, newMsg];

    // Update locally + DB
    updateNode(selectedNodeId, { messages: updatedMessages as unknown as any });
    setUserInput('');

    await supabase.from('nodes').update({ messages: updatedMessages as unknown as Database['public']['Tables']['nodes']['Update']['messages'] }).eq('id', selectedNodeId);

    // Auto-generate AI response in linear mode
    if (selectedNode.mode === 'linear') {
      await generateLinearResponse(selectedNodeId, updatedMessages);
    }

    // Generate AI title for sidebar after first real message
    if (needsTitle) {
      generateConversationTitle(trimmedInput);
    }
  }

  async function generateLinearResponse(nodeId: string, msgs: ChatMessage[]) {
    setIsGenerating(true);
    try {
      const allMessages = buildChatContext();
      // Use the updated messages
      const contextMsgs = allMessages.slice(0, allMessages.length - msgs.length).concat(msgs);
      
      const { data, error } = await invokeWithRetry('generate-response', {
        body: {
          mode: 'chat',
          // Ask the function to return structured content without markdown bullets.
          // We also do a client-side postprocess as a fallback.
          format: 'structured-no-markdown',
          messages: contextMsgs,
        },
      });
      if (error) throw error;

      const raw = (data.content || data.step || 'No response.') as string;
      const aiMsg: ChatMessage = { role: 'assistant', content: normalizeAiText(raw) };
      const finalMessages = [...msgs, aiMsg];
      updateNode(nodeId, { messages: finalMessages as unknown as any });
      await supabase.from('nodes').update({ messages: finalMessages as unknown as Database['public']['Tables']['nodes']['Update']['messages'] }).eq('id', nodeId);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate response');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleBranch(count: number) {
    if (!selectedNodeId || !currentConversationId) return;
    setIsGenerating(true);
    const needsTitle = useTreeStore.getState().conversations.find(c => c.id === currentConversationId)?.title === 'New Conversation';
    let firstMessageContent = userInput.trim() || messages[0]?.content || '';
    try {
      let currentMessages = messages;
      
      if (userInput.trim()) {
        const newMsg: ChatMessage = { role: 'user', content: userInput.trim() };
        currentMessages = [...messages, newMsg];
        updateNode(selectedNodeId, { messages: currentMessages as unknown as any });
        firstMessageContent = userInput.trim();
        setUserInput('');
        
        await supabase.from('nodes').update({ messages: currentMessages as unknown as Database['public']['Tables']['nodes']['Update']['messages'] }).eq('id', selectedNodeId);
      }

      const baseContext = buildChatContext();
      const contextWithoutCurrent = baseContext.slice(0, baseContext.length - messages.length);
      const contextMsgs = [...contextWithoutCurrent, ...currentMessages];

      const { data, error } = await invokeWithRetry('generate-response', {
        body: { mode: 'branch', messages: contextMsgs, branchCount: count },
      });
      if (error) throw error;

      const options = data.options || [];
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const pos = calcChildPosition(selectedNodeId);
        // Offset each sibling
        pos.x = pos.x + i * 320 - ((options.length - 1) * 160);

        const { data: node, error: insertErr } = await supabase
          .from('nodes')
          .insert({
            conversation_id: currentConversationId,
            parent_id: selectedNodeId,
            content: opt.title,
            role: 'assistant',
            messages: [{ role: 'assistant', content: `**${opt.title}**\n\n${opt.reason}` }] as any,
            status: 'active' as NodeStatus,
            mode: 'linear',
            is_expanded: true,
            position_x: pos.x,
            position_y: pos.y,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        addNode(node);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate branches');
    } finally {
      setIsGenerating(false);
      // Generate AI title for sidebar after first real message
      if (needsTitle && firstMessageContent) {
        generateConversationTitle(firstMessageContent);
      }
    }
  }

  async function handleCollapse() {
    if (!selectedNodeId || !selectedNode) return;
    
    if (selectedNode.summary && selectedNode.summary !== 'Collapsed node') {
      updateNode(selectedNodeId, { is_expanded: false });
      await supabase.from('nodes').update({ is_expanded: false }).eq('id', selectedNodeId);
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await invokeWithRetry('generate-response', {
        body: {
          mode: 'summarize',
          messages,
        },
      });
      if (error) throw error;

      const summary = data.summary || 'Collapsed node';
      updateNode(selectedNodeId, { is_expanded: false, summary });
      await supabase.from('nodes').update({ is_expanded: false, summary }).eq('id', selectedNodeId);
    } catch (e: any) {
      toast.error(e.message || 'Failed to summarize');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExpand() {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, { is_expanded: true });
    await supabase.from('nodes').update({ is_expanded: true }).eq('id', selectedNodeId);
  }

  async function handleStatusChange(status: NodeStatus) {
    if (!selectedNodeId) return;
    await supabase.from('nodes').update({ status }).eq('id', selectedNodeId);
    updateNodeStatus(selectedNodeId, status);
  }

  async function handleKillBranch() {
    if (!selectedNodeId || !currentConversationId) return;

    setIsGenerating(true);
    try {
      // Rules:
      // - Keep nodes that were continued (have children) OR are marked success
      // - Delete leaf nodes that are failed/unused

      const byId = new Map(nodes.map((n) => [n.id, n] as const));
      const childrenByParent = new Map<string, string[]>();
      for (const n of nodes) {
        if (!n.parent_id) continue;
        const arr = childrenByParent.get(n.parent_id) ?? [];
        arr.push(n.id);
        childrenByParent.set(n.parent_id, arr);
      }

      const hasChildren = (id: string) => (childrenByParent.get(id)?.length ?? 0) > 0;

      // Start from selected node and walk its subtree
      const subtree: string[] = [];
      const stack = [selectedNodeId];
      while (stack.length) {
        const id = stack.pop()!;
        subtree.push(id);
        const kids = childrenByParent.get(id) ?? [];
        for (const k of kids) stack.push(k);
      }

      const toDelete = new Set<string>();
      for (const id of subtree) {
        const node = byId.get(id);
        if (!node) continue;

        const continued = hasChildren(id);
        const successful = node.status === 'success';
        const leaf = !continued;

        // delete ONLY leaf nodes that are failed (or inactive) and not successful
        if (leaf && !successful && (node.status === 'failed' || node.status === 'active')) {
          // never delete the selected root itself; if user wants that they can delete the conversation/node explicitly.
          if (id !== selectedNodeId) toDelete.add(id);
        }
      }

      if (toDelete.size === 0) {
        toast.message('No branches to prune');
        return;
      }

      // Delete from DB first (children will be included since we only delete leaves)
      const { error } = await supabase.from('nodes').delete().in('id', Array.from(toDelete));
      if (error) throw error;

      // Update local store
      setNodes(nodes.filter((n) => !toDelete.has(n.id)));

      // If selected node was deleted (should not happen), clear selection
      if (toDelete.has(selectedNodeId)) setSelectedNode(null);

      toast.success(`Pruned ${toDelete.size} branch node(s)`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to prune branches');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCreateRootNode() {
    if (!currentConversationId) return;
    const { data: node, error } = await supabase
      .from('nodes')
      .insert({
        conversation_id: currentConversationId,
        parent_id: null,
        content: '',
        role: 'user',
        messages: [] as any,
        status: 'active' as NodeStatus,
        mode: 'linear',
        is_expanded: true,
        position_x: 0,
        position_y: 0,
      })
      .select()
      .single();
    if (error) {
      toast.error('Failed to create node');
      return;
    }
    addNode(node);
    setSelectedNode(node.id);
  }

  // No conversation selected
  if (!currentConversationId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--surface_container_high)] p-4">
        <p className="text-sm text-[var(--on_surface_muted)] text-center">Create or select a conversation</p>
      </div>
    );
  }

  // No node selected
  if (!selectedNode) {
    return (
      <div className="flex h-full w-full flex-col bg-[var(--surface_container_high)]">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <MessageSquare className="h-8 w-8 text-[var(--on_surface_muted)] mb-3" />
          <p className="text-sm text-[var(--on_surface_muted)] text-center mb-4">Select a node or create one to start</p>
          {nodes.length === 0 && (
            <Button size="sm" onClick={handleCreateRootNode} className="gap-2 bg-[var(--cta-gradient)] text-[var(--on_primary)]">
              <Play className="h-4 w-4" /> Start Conversation
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isExpanded = selectedNode.is_expanded;

  return (
    <div className="flex h-full w-full flex-col bg-[var(--surface_container_high)]">
      {/* Header (no divider lines; use tonal + spacing) */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--on_surface)]">Node Chat</h2>
          <Badge variant="secondary" className="text-[10px] capitalize bg-[rgba(229,226,225,0.06)] text-[var(--on_surface)]">
            {selectedNode.mode}
          </Badge>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] capitalize ${
              selectedNode.status === 'active' ? 'bg-[rgba(184,195,255,0.14)] text-[var(--primary)]' :
              selectedNode.status === 'failed' ? 'bg-[rgba(255,180,171,0.14)] text-[var(--error)]' :
              'bg-[rgba(122,227,177,0.14)] text-[var(--node-success)]'
            }`}
          >
            {selectedNode.status}
          </span>
        </div>
      </div>

      {isExpanded ? (
        <>
          {/* Chat messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[var(--cta-gradient)] text-[var(--on_primary)]'
                        : 'bg-[var(--surface_container_highest)] text-[var(--on_surface)]'
                    }`}
                  >
                    <StructuredMessage content={msg.content} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-surface rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Controls (no divider line; use spacing + recessed input well) */}
          <div className="p-3 space-y-2">
            {/* Branch buttons */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => handleBranch(3)} disabled={isGenerating}>
                <GitBranch className="h-3 w-3" /> 3 Options
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => handleBranch(5)} disabled={isGenerating}>
                <GitBranch className="h-3 w-3" /> 5 Options
              </Button>
            </div>

            {/* Status + collapse controls */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs text-node-success border-node-success/30" onClick={() => handleStatusChange('success')}>
                <CheckCircle2 className="h-3 w-3" /> Success
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs text-node-failed border-node-failed/30" onClick={() => handleStatusChange('failed')}>
                <XCircle className="h-3 w-3" /> Failed
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={handleCollapse} disabled={isGenerating}>
                <ChevronUp className="h-3 w-3" /> Collapse
              </Button>
            </div>

            <Button size="sm" variant="ghost" className="w-full gap-1 text-xs text-destructive" onClick={handleKillBranch}>
              <Skull className="h-3 w-3" /> Kill Branch
            </Button>

            {/* Chat input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex gap-2"
            >
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                className="text-sm bg-[var(--surface_container_lowest)] text-[var(--on_surface)] placeholder:text-[var(--on_surface_muted)] border-0 focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
                disabled={isGenerating}
              />
              <Button type="submit" size="icon" disabled={!userInput.trim() || isGenerating} className="bg-[var(--cta-gradient)] text-[var(--on_primary)]">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      ) : (
        /* Collapsed view */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-foreground font-medium mb-2">{selectedNode.summary || 'No summary'}</p>
          <p className="text-xs text-muted-foreground mb-4">{messages.length} message(s)</p>
          <Button size="sm" variant="outline" className="gap-1" onClick={handleExpand}>
            <ChevronDown className="h-3 w-3" /> Expand Node
          </Button>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs text-node-success border-node-success/30" onClick={() => handleStatusChange('success')}>
              <CheckCircle2 className="h-3 w-3" /> Success
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs text-node-failed border-node-failed/30" onClick={() => handleStatusChange('failed')}>
              <XCircle className="h-3 w-3" /> Failed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
