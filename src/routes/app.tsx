import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from '@tanstack/react-router';
import { ClientOnly } from '@tanstack/react-router';
import Sidebar from '@/components/Sidebar';
import GraphCanvas from '@/components/GraphCanvas';
import NodeChatPanel from '@/components/NodeChatPanel';
import { Loader2 } from 'lucide-react';
import SiteShell from '@/components/layout/SiteShell';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle, usePanelRef } from 'react-resizable-panels';

export const Route = createFileRoute('/app')({
  head: () => ({
    meta: [
      { title: 'TreeGPT — App' },
      { name: 'description', content: 'TreeGPT branching conversation workspace.' },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  return (
    <ClientOnly fallback={<LoadingScreen />}>
      <AuthGate />
    </ClientOnly>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function AuthGate() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const sidebarPanelRef = usePanelRef();

  const handleSidebarToggle = useCallback(() => {
    if (!sidebarPanelRef.current) return;
    if (sidebarPanelRef.current.isCollapsed()) {
      sidebarPanelRef.current.expand();
    } else {
      sidebarPanelRef.current.collapse();
    }
  }, [sidebarPanelRef]);

  const handleSidebarResize = useCallback(() => {
    if (!sidebarPanelRef.current) return;
    setSidebarCollapsed(sidebarPanelRef.current.isCollapsed());
  }, [sidebarPanelRef]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
        if (!session) navigate({ to: '/login' });
      });
      subscription = res.data.subscription;

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
        if (!session) navigate({ to: '/login' });
      });
    } catch (e) {
      // If Supabase isn't configured, avoid hard-crashing the entire route.
      setLoading(false);
      setSession(null);
      // eslint-disable-next-line no-console
      console.error(e);
    }

    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (loading) return <LoadingScreen />;
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">Supabase isn’t configured</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The app can’t load because <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (or{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>) aren’t available at runtime.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Check <code>.env</code>, restart the dev server, then try again.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => navigate({ to: '/login', replace: true })}
            >
              Back to login
            </button>
            <a className="rounded-md border border-input px-4 py-2 text-sm" href="/">
              Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SiteShell variant="app">
      <PanelGroup orientation="horizontal" className="flex-1 h-full overflow-hidden bg-[var(--surface)] text-[var(--on_surface)]">
        {/* Sidebar surface */}
        <Panel
          defaultSize="20%"
          minSize="15%"
          maxSize="30%"
          collapsible={true}
          collapsedSize="4%"
          panelRef={sidebarPanelRef}
          onResize={handleSidebarResize}
        >
          <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
        </Panel>

        <PanelResizeHandle className="w-1 cursor-col-resize bg-[var(--outline_variant)] hover:bg-[var(--primary)] active:bg-[var(--primary)] transition-colors opacity-50 hover:opacity-100" />

        {/* Main canvas surface */}
        <Panel defaultSize="55%" minSize="30%">
          <div className="h-full relative bg-[var(--surface)]">
            <GraphCanvas />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 cursor-col-resize bg-[var(--outline_variant)] hover:bg-[var(--primary)] active:bg-[var(--primary)] transition-colors opacity-50 hover:opacity-100" />

        {/* Inspector surface */}
        <Panel defaultSize="25%" minSize="20%" maxSize="50%">
          <NodeChatPanel />
        </Panel>
      </PanelGroup>
    </SiteShell>
  );
}
