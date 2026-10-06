import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { prepareDrama } from '@/lib/video/prepare.functions';
import { DramaVideo } from './DramaVideo';
import { WordText } from './WordText';
import { Button } from './ui/button';

export function DramaPanel({placeId,onClose}:{placeId:string;onClose:()=>void}) {
  const prepare=useServerFn(prepareDrama);
  const [episode,setEpisode]=useState<any>(null);
  const [busy,setBusy]=useState(false);
  const [working,setWorking]=useState(false);
  const [error,setError]=useState('');
  async function run(){
    setBusy(true);setError('');
    try {const r=await prepare({data:{placeId}});if(r.status==='script_ready'){setEpisode(r.episode);setWorking(false);}else setWorking(true);}
    catch(e){setError((e as Error).message);setWorking(false);}
    finally{setBusy(false);}
  }
  useEffect(()=>{if(!working||busy)return;const h=setTimeout(()=>void run(),5000);return()=>clearTimeout(h);},[working,busy]);
  return <section className="paper-card my-4 space-y-4 p-4" aria-label="Neighbour drama">
    <div className="flex justify-between gap-4"><h2 className="text-lg font-semibold">A little drama</h2><Button variant="ghost" onClick={onClose}>Close</Button></div>
    {!episode&&<><p className="text-sm">Make an original eight-line episode using your learned words and this neighbour’s world. The script is checked before any video is made.</p><Button disabled={busy||working} onClick={()=>void run()}>{busy||working?'Planning and checking the episode…':'Prepare my episode'}</Button></>}
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    {episode&&<>
      <WordText tokens={episode.script.title} size="md"/>
      <p className="text-sm text-muted-foreground">{episode.script.title_en}</p>
      <p className="text-sm">Checked script · four silent video scenes with Chinese captions. Generate each scene below. Generated visuals are previews awaiting review; speech is not added yet.</p>
      {episode.requests.map((request:any,i:number)=><div key={request.contentRef} className="space-y-3 border-t pt-3">
        <h3 className="font-medium">Scene {i+1}</h3>
        {episode.script.lines.slice(i*2,i*2+2).map((line:any)=><div key={line.id}><WordText tokens={line.tokens} size="md"/><p className="text-sm text-muted-foreground">{line.en}</p></div>)}
        <DramaVideo request={request}/>
      </div>)}
    </>}
  </section>;
}
