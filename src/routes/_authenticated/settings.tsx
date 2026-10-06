import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell, useBootstrap } from "@/components/AppShell";
import { updateSettings, importMyWords } from "@/lib/app.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Laoshu Laoshi" }, { name: "description", content: "Your profile, pace and word import." }, { property: "og:title", content: "Settings — Laoshu Laoshi" }, { property: "og:description", content: "Settings." }] }),
  component: Settings,
});

function Settings() {
  const boot = useBootstrap();
  const qc = useQueryClient();
  const save = useServerFn(updateSettings);
  const imp = useServerFn(importMyWords);
  const l = boot.data?.learner;
  const [f, setF] = useState<Record<string, string | number | boolean>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (l) setF({ display_name: l.display_name, chinese_name: l.chinese_name ?? "", chinese_name_pinyin: l.chinese_name_pinyin ?? "", daily_recognise: l.daily_recognise, daily_produce: l.daily_produce, lesson_pace: l.lesson_pace, pinyin_on: l.pinyin_on, timezone: l.timezone });
  }, [l]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value });

  return (
    <AppShell title="Settings">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="paper-card mt-4 grid gap-4 p-5 sm:grid-cols-2">
        <div><Label>Display name</Label><Input value={String(f.display_name ?? "")} onChange={set("display_name")} /></div>
        <div><Label>Timezone</Label><Input value={String(f.timezone ?? "")} onChange={set("timezone")} /></div>
        <div><Label>Chinese name (optional)</Label><Input value={String(f.chinese_name ?? "")} onChange={set("chinese_name")} lang="zh-CN" /></div>
        <div><Label>Its pinyin, tone numbers (e.g. tang1 mu3)</Label><Input value={String(f.chinese_name_pinyin ?? "")} onChange={set("chinese_name_pinyin")} /></div>
        <div><Label>Daily Chinese → English</Label><Input type="number" min={1} value={Number(f.daily_recognise ?? 10)} onChange={set("daily_recognise")} /></div>
        <div><Label>Daily English → Chinese</Label><Input type="number" min={1} value={Number(f.daily_produce ?? 10)} onChange={set("daily_produce")} /></div>
        <div><Label>Lesson pace (words per sitting)</Label><Input type="number" min={1} value={Number(f.lesson_pace ?? 5)} onChange={set("lesson_pace")} /></div>
        <div className="flex items-center gap-3 pt-6"><Switch checked={!!f.pinyin_on} onCheckedChange={(v) => setF({ ...f, pinyin_on: v })} id="py" /><Label htmlFor="py">Show pinyin</Label></div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button
            onClick={async () => {
              setSaved(null);
              try {
                await save({ data: { ...f, chinese_name: (f.chinese_name as string) || null, chinese_name_pinyin: (f.chinese_name_pinyin as string) || null } as never });
                setSaved("Saved");
                qc.invalidateQueries();
              } catch (e) {
                setSaved("Could not save: " + (e as Error).message);
              }
            }}
          >
            Save
          </Button>
          {saved && <span className="text-sm text-muted-foreground">{saved}</span>}
        </div>
      </section>

      <section className="paper-card mt-6 p-5">
        <h2 className="text-xl font-semibold">Import my words</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the export file from the previous Laoshu app. It stays private: it is read in your browser and sent only to your account. Importing twice never duplicates words.
        </p>
        <Input
          type="file"
          accept="application/json,.json"
          className="mt-3"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setImportMsg("Importing…");
            try {
              const json = JSON.parse(await file.text());
              const r = await imp({ data: json });
              const skipped = r.skipped + (r.duplicatesInFile ?? 0);
              setImportMsg(`${r.entered} entered your repertoire · ${r.queued} queued · ${skipped} skipped (${r.skipped} already yours${r.duplicatesInFile ? `, ${r.duplicatesInFile} repeated entries in the file — the most recently reviewed copy was kept` : ""}). Total ${r.entered + r.queued + skipped}.`);
              qc.invalidateQueries();
            } catch (err) {
              setImportMsg("Import failed, nothing was changed. " + (err as Error).message.slice(0, 300));
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
        {importMsg && <p className="mt-2 text-sm" role="status">{importMsg}</p>}
      </section>

      <section className="paper-card mt-6 p-5 not-built">
        <h2 className="text-xl font-semibold">Export my words · Report a problem</h2>
        <p className="text-sm">Not built yet</p>
      </section>
    </AppShell>
  );
}
