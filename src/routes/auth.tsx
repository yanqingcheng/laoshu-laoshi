import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Laoshu Laoshi" },
      { name: "description", content: "Sign in to your Laoshu Laoshi world." },
      { property: "og:title", content: "Sign in — Laoshu Laoshi" },
      { property: "og:description", content: "Sign in to your Laoshu Laoshi world." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && nav({ to: "/home", replace: true }));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => s && nav({ to: "/home", replace: true }));
    return () => data.subscription.unsubscribe();
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin + "/home" } });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="paper-card w-full max-w-sm p-7">
        <div className="text-5xl" style={{ fontFamily: "var(--font-han)" }} lang="zh-CN">老鼠老师</div>
        <h1 className="mt-1 text-2xl font-semibold">Laoshu Laoshi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your words become a little world.</p>
        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
            if (r.error) setMsg(String(r.error.message ?? r.error));
          }}
        >
          Continue with Google
        </Button>
        <div className="my-4 text-center text-xs text-muted-foreground">or with email</div>
        <form onSubmit={submit} className="space-y-3">
          <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <Input type="password" required minLength={6} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
        </form>
        {msg && <p className="mt-3 text-sm text-terracotta" role="status">{msg}</p>}
        <button className="mt-4 text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
