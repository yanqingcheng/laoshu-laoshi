import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RecreationHub } from "@/components/park/RecreationHub";

export const Route = createFileRoute("/_authenticated/park")({
  head: () => ({ meta: [{ title: "Playground — Laoshu Laoshi" }] }),
  component: () => <AppShell title="Playground"><RecreationHub room="playground" /></AppShell>,
});
