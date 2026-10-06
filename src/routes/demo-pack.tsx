import { createFileRoute, Link } from '@tanstack/react-router';
import { DemoPackGame } from '@/components/demo-pack/DemoPackGame';

export const Route=createFileRoute('/demo-pack')({
  head:()=>({meta:[{title:'Panda garden — Laoshu Laoshi'}]}),
  component:DemoPack,
});

function DemoPack(){
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Prepared book-inspired demo pack</p><h1 className="text-3xl font-semibold">Panda garden</h1></div>
      <div className="flex gap-3 text-sm"><Link to="/home">Home</Link><Link to="/book">Bring a book</Link></div>
    </header>
    <div className="grid items-center gap-4 overflow-hidden rounded-2xl bg-secondary md:grid-cols-2">
      <img src="/art/demo-pack/panda-scene.png" alt="An original panda neighbour in a painted-paper bamboo garden" className="aspect-[3/2] w-full object-cover" />
      <div className="space-y-2 p-5"><h2 className="text-2xl font-semibold">A book becomes a little world</h2><p className="text-sm text-muted-foreground">Explore bamboo, paws, fur and a cosy bed. Original activities inspired by the panda book’s vocabulary, prepared for this demo.</p><p className="text-xs text-muted-foreground">Playing does not change your learning record.</p><a href="#panda-game" className="inline-block rounded-lg bg-primary px-4 py-3 text-primary-foreground">Play with the panda ↓</a></div>
    </div>
    <div id="panda-game" className="scroll-mt-4">
    <DemoPackGame/>
    </div>
  </main>;
}
