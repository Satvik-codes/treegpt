import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, LogOut, TreePine, Trash2, Search, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTreeStore } from '@/stores/tree-store';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from '@tanstack/react-router';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const {
    conversations, currentConversationId,
    setConversations, setCurrentConversation, setNodes, setIsLoading, setSelectedNode,
  } = useTreeStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { if (editingId && editRef.current) { editRef.current.focus(); editRef.current.select(); } }, [editingId]);

  async function loadConversations() {
    const { data, error } = await supabase.from('conversations').select('*').order('updated_at', { ascending: false });
    if (error) { console.error('Failed to load conversations'); return; }
    setConversations(data || []);
    if (data && data.length > 0) {
      const currentId = useTreeStore.getState().currentConversationId;
      if (!currentId) {
        selectConversation(data[0].id);
      }
    }
  }

  async function createConversation() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Not signed in');
      return;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single();

    if (error) {
      console.error(`Failed to create conversation: ${error.message}`);
      // eslint-disable-next-line no-console
      console.error('[createConversation] insert conversations failed', error);
      return;
    }

    // Create an initial/root node so the graph/chat has something to render.
    // This avoids a "blank" conversation that can't be interacted with.
    const { data: node, error: nodeErr } = await supabase
      .from('nodes')
      .insert({
        conversation_id: data.id,
        parent_id: null,
        content: 'Start here',
        role: 'user',
        status: 'active' as any,
        mode: 'linear',
        is_expanded: true,
        messages: [{ role: 'user', content: 'Start here' }] as any,
        position_x: 0,
        position_y: 0,
      })
      .select()
      .single();

    if (nodeErr) {
      console.error(`Created conversation, but failed to create first node: ${nodeErr.message}`);
      // eslint-disable-next-line no-console
      console.error('[createConversation] insert nodes failed', nodeErr);
    }

    setConversations([data, ...conversations]);
    await selectConversation(data.id);
    if (node) setSelectedNode(node.id);
  }

  async function selectConversation(id: string) {
    setCurrentConversation(id);
    setSelectedNode(null);
    setIsLoading(true);
    const { data, error } = await supabase.from('nodes').select('*').eq('conversation_id', id).order('created_at', { ascending: true });
    setIsLoading(false);
    if (error) { console.error('Failed to load nodes'); return; }
    setNodes(data || []);
  }

  async function deleteConversation(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await supabase.from('nodes').delete().eq('conversation_id', id);
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (error) { console.error('Failed to delete conversation'); return; }
    setConversations(conversations.filter((c) => c.id !== id));
    if (currentConversationId === id) { setCurrentConversation(null); setNodes([]); setSelectedNode(null); }
    console.log('Conversation deleted');
  }

  function handleDoubleClick(id: string, title: string) { setEditingId(id); setEditValue(title); }

  async function handleRenameSubmit(id: string) {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === conversations.find(c => c.id === id)?.title) { setEditingId(null); return; }
    const { error } = await supabase.from('conversations').update({ title: trimmed }).eq('id', id);
    if (error) { console.error('Failed to rename'); setEditingId(null); return; }
    setConversations(conversations.map(c => c.id === id ? { ...c, title: trimmed } : c));
    setEditingId(null);
  }

  async function handleLogout() { await supabase.auth.signOut(); navigate({ to: '/login' }); }

  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (collapsed) {
    return (
      <div className="flex h-full w-full flex-col items-center bg-[var(--surface_container_low)] py-3 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-[var(--on_surface_muted)] hover:bg-[rgba(229,226,225,0.06)]"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <Button size="icon" onClick={createConversation} className="mt-2 bg-[#c8913a] text-[#0a0e08] hover:bg-[#e8a84a]">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[var(--surface_container_low)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <TreePine className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-lg font-bold text-[var(--on_surface)]">TreeGPT</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 text-[var(--on_surface_muted)] hover:bg-[rgba(229,226,225,0.06)]"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-2">
        <Button
          onClick={createConversation}
          className="w-full gap-2 bg-[#c8913a] text-[#0a0e08] hover:bg-[#e8a84a]"
          size="sm"
        >
          <Plus className="h-4 w-4" /> <span>New Conversation</span>
        </Button>

        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--on_surface_muted)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-8 h-8 text-xs bg-[var(--surface_container_lowest)] text-[var(--on_surface)] placeholder:text-[var(--on_surface_muted)] border-0 focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
              autoFocus
            />
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--on_surface_muted)] hover:text-[var(--on_surface)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-[var(--on_surface_muted)] hover:text-[var(--on_surface)] hover:bg-[rgba(229,226,225,0.06)]"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-4 w-4" /> Search
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 pl-2 pr-[10px]">
        <AnimatePresence>
          {filtered.map((conv) => (
            <motion.div key={conv.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="group mb-1">
              {editingId === conv.id ? (
                <form onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(conv.id); }} className="px-1">
                  <Input ref={editRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleRenameSubmit(conv.id)} onKeyDown={(e) => { if (e.key === 'Escape') setEditingId(null); }} className="h-8 text-sm bg-input" />
                </form>
              ) : (
                <div className={`relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
                    conv.id === currentConversationId
                      ? 'text-[var(--on_surface)] font-medium'
                      : 'text-[var(--on_surface)] hover:bg-[rgba(229,226,225,0.06)]'
                  }`}
                  onClick={() => selectConversation(conv.id)}
                  onDoubleClick={() => handleDoubleClick(conv.id, conv.title)}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      conv.id === currentConversationId ? 'bg-[var(--primary)]' : 'bg-transparent'
                    }`}
                  />
                  <MessageSquare className="h-4 w-4 shrink-0 text-[var(--on_surface_muted)]" />
                  <span className="truncate flex-1 min-w-0 pr-6">{conv.title}</span>
                  <button
                    onClick={(e) => deleteConversation(e, conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--on_surface_muted)] hover:text-[var(--error)] p-1 z-10 rounded-sm bg-[var(--surface_container_low)] group-hover:bg-[#1a2714]"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>

      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-[var(--on_surface_muted)] hover:text-[var(--on_surface)] hover:bg-[rgba(229,226,225,0.06)]"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
