import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { bootstrap } from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function useBootstrap() {
  const fn = useServerFn(bootstrap);
  return useQuery({
    queryKey: ["bootstrap"],
    queryFn: () => fn({ data: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } }),
    staleTime: 60_000,
  });
}

export function CouldNotLoad({ onRetry, detail }: { onRetry: () => void; detail?: string }) {
  return (
    <div className="paper-card mx-auto max-w-md p-6 text-center" role="alert">
      <p className="font-semibold">Could not load</p>
      {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
      <Button className="mt-4" onClick={onRetry}>Retry</Button>
    </div>
  );
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const boot = useBootstrap();
  const qc = useQueryClient();
  const nav = useNavigate();
  const learner = boot.data?.learner;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
          <Link to="/home" className="flex items-baseline gap-2">
            <span className="whitespace-nowrap text-lg text-primary sm:text-xl" style={{ fontFamily: "var(--font-han)" }} lang="zh-CN">老鼠老师</span>
            {title && <span className="hidden text-sm text-muted-foreground sm:inline">· {title}</span>}
          </Link>
          <nav className="ml-auto flex items-center gap-0.5 text-xs sm:gap-1 sm:text-sm">
            <Link to="/home" className="rounded px-2 py-1 hover:bg-secondary" activeProps={{ className: "bg-secondary font-semibold" }}>Home</Link>
            <Link to="/town" className="rounded px-2 py-1 hover:bg-secondary" activeProps={{ className: "bg-secondary font-semibold" }}>Town</Link>
            <Link to="/settings" className="rounded px-2 py-1 hover:bg-secondary" activeProps={{ className: "bg-secondary font-semibold" }}>Settings</Link>
            <Link to="/dev" className="rounded px-2 py-1 text-muted-foreground hover:bg-secondary">Dev</Link>
            <button
              className="rounded px-2 py-1 text-muted-foreground hover:bg-secondary"
              onClick={async () => {
                await qc.cancelQueries();
                qc.clear();
                await supabase.auth.signOut();
                nav({ to: "/auth", replace: true });
              }}
            >
              Sign out
            </button>
          </nav>
        </div>
        {learner?.is_synthetic && (
          <div className="bg-terracotta px-4 py-1 text-center text-xs font-semibold text-terracotta-foreground">
            Synthetic development learner — not Tom's real progress
          </div>
        )}
        {boot.data?.courseError && (
          <div className="bg-destructive px-4 py-1 text-center text-xs text-destructive-foreground">
            Course failed to load: {boot.data.courseError}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {boot.isError ? <CouldNotLoad onRetry={() => boot.refetch()} detail={(boot.error as Error).message} /> : children}
      </main>
    </div>
  );
}
