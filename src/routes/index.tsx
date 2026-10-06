import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laoshu Laoshi — learn the Chinese in your books" },
      { name: "description", content: "Bring a book; Laoshu Laoshi finds the words, teaches them, and grows a little world of neighbours, stories and games around them." },
      { property: "og:title", content: "Laoshu Laoshi — learn the Chinese in your books" },
      { property: "og:description", content: "Your words become an explorable personal world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <div className="text-6xl text-primary" style={{ fontFamily: "var(--font-han)" }} lang="zh-CN">老鼠老师</div>
      <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Learn the Chinese in the books you actually read.</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Photograph a picture book. The mouse teacher finds the words you need, teaches them, and builds a neighbour,
        stories and games that reuse everything you already know.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg"><Link to="/home">Enter your world</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/auth">Sign in</Link></Button>
      </div>
    </main>
  );
}
