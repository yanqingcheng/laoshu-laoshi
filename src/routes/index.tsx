import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { artUrl } from "@/lib/art";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laoshu Laoshi — your Chinese, your world" },
      {
        name: "description",
        content:
          "Learn the Chinese that matters to you. Stories, conversations and games shaped around your life and the words you know.",
      },
      { property: "og:title", content: "Laoshu Laoshi — your Chinese, your world" },
      {
        property: "og:description",
        content: "Your vocabulary. Your interests. A world that grows with your Chinese.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="landing-hero">
      <div className="landing-copy">
        <div
          className="landing-brand text-primary"
          style={{ fontFamily: "var(--font-han)" }}
          lang="zh-CN"
        >
          老鼠老师
        </div>
        <h1 className="mt-3 font-semibold leading-tight">
          Your Chinese.
          <br />
          Your world.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Learn the words that matter to you. Practise through stories, conversations and games
          shaped around your life and the Chinese you already know.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="min-h-12">
            <Link to="/home">Enter your world</Link>
          </Button>
          <Link
            to="/auth"
            className="inline-flex min-h-12 items-center px-2 text-sm font-semibold text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>
      <picture className="landing-art">
        <source
          media="(max-width: 899px)"
          srcSet={`${artUrl("landing/landing-hero-mobile.png", true)} 800w, ${artUrl("landing/landing-hero-mobile.png")} 1024w`}
          sizes="100vw"
          width="1024"
          height="1536"
        />
        <img
          src={artUrl("landing/landing-hero-desktop.png")}
          srcSet={`${artUrl("landing/landing-hero-desktop.png", true)} 800w, ${artUrl("landing/landing-hero-desktop.png")} 1536w`}
          sizes="100vw"
          width="1536"
          height="1024"
          fetchPriority="high"
          alt="The mouse teacher, dog and cat welcome you into a painted world of books and neighbours"
          className="h-auto w-full"
        />
      </picture>
    </main>
  );
}
