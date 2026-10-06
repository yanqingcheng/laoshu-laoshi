import {describe,it,expect} from 'vitest';
import {DramaScript,DramaReview,shotsFromScript} from '../lib/video/script';

const fixture=()=>({title:[{w:'好',p:'hao3'}],title_en:'Good',lines:Array.from({length:8},(_,i)=>({id:`l${i+1}`,speaker:i%2?'guest':'host',tokens:[{w:'好',p:'hao3'},{w:i===7?'？':'。'}],en:i===7?'Good?':'Good.',direction_en:'The host offers the parcel; the guest reacts.'})),reversal_line:'l6',next_time_en:'What is inside?',needs:[]});
describe('drama script and clip contract',()=>{
  it('requires ordered lines, a final question, and bounded lexical length',()=>{
    expect(DramaScript.safeParse(fixture()).success).toBe(true);
    const duplicate=fixture();duplicate.lines[1].id='l1';
    expect(DramaScript.safeParse(duplicate).success).toBe(false);
    const noQuestion=fixture();noQuestion.lines[7].tokens=[{w:'好',p:'hao3'}];
    expect(DramaScript.safeParse(noQuestion).success).toBe(false);
    const long=fixture();long.lines[0].tokens=Array.from({length:9},()=>({w:'好',p:'hao3'}));
    expect(DramaScript.safeParse(long).success).toBe(false);
  });
  it('preserves every caption exactly once across four bounded clips',()=>{
    const script=DramaScript.parse(fixture());
    const shots=shotsFromScript(script,'test','A quiet room',[{name:'host',look:'Mouse'}]);
    expect(shots).toHaveLength(4);
    expect(new Set(shots.map(s=>s.contentRef)).size).toBe(4);
    expect(shots.flatMap(s=>s.captions.map(c=>c.zh))).toEqual(script.lines.map(l=>l.tokens.map(t=>t.w).join('')));
    for(const shot of shots){
      expect(shot.durationS).toBe(8);
      expect(shot.captions.every(c=>c.atS>=0&&c.untilS<=shot.durationS&&c.untilS>c.atS)).toBe(true);
      expect(shot.beats).toHaveLength(2);
    }
  });
  it('rejects malformed independent review rather than treating it as approval',()=>{
    expect(DramaReview.safeParse({verdict:'accept'}).success).toBe(false);
    expect(DramaReview.safeParse({verdict:'looks good',issues:[]}).success).toBe(false);
  });
});
