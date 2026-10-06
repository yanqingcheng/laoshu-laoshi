import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RecreationHub } from "@/components/park/RecreationHub";

export const Route = createFileRoute("/_authenticated/gym")({
  head: () => ({ meta: [{ title: "Gym — Laoshu Laoshi" }] }),
  component: () => <AppShell title="Gym"><RecreationHub room="gym" /></AppShell>,
});
