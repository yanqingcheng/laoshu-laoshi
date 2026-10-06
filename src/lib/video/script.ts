import { z } from 'zod';

export const DramaToken = z.object({w:z.string().min(1).max(40),p:z.string().max(100).optional()});
export const DramaScript = z.object({
  title:z.array(DramaToken).min(1).max(20),title_en:z.string().min(1).max(160),
  lines:z.array(z.object({id:z.string(),speaker:z.enum(['host','guest']),tokens:z.array(DramaToken).min(1).max(16),en:z.string().max(500),direction_en:z.string().min(3).max(800)})).length(8),
  reversal_line:z.enum(['l4','l5','l6','l7']),next_time_en:z.string().max(400),needs:z.array(z.unknown()).max(30),
}).superRefine((s,ctx)=>{
  s.lines.forEach((l,i)=>{
    if(l.id!==`l${i+1}`) ctx.addIssue({code:'custom',path:['lines',i,'id'],message:'Expected ordered IDs l1–l8'});
    if(l.tokens.filter(t=>/\p{Script=Han}/u.test(t.w)).length>8) ctx.addIssue({code:'custom',path:['lines',i,'tokens'],message:'At most eight lexical tokens per line'});
  });
  if(!/[？?]$/.test(s.lines[7].tokens.map(t=>t.w).join(''))) ctx.addIssue({code:'custom',path:['lines',7],message:'Final line must be a question'});
});
export type CheckedDramaScript=z.infer<typeof DramaScript>;
export const DramaReview=z.object({verdict:z.enum(['accept','revise','uncertain']),issues:z.array(z.object({path:z.string(),requirement:z.string(),observed:z.string(),correction:z.string()}))});

export function shotsFromScript(script:CheckedDramaScript, itemId:string, setting:string, cast:{name:string;look:string}[]) {
  return Array.from({length:4},(_,i)=>{
    const lines=script.lines.slice(i*2,i*2+2);
    return {contentRef:`episode:${itemId}:shot${i+1}`,setting,cast,beats:lines.map(l=>l.direction_en),
      sound:'Silent visual performance. No speech, vocals or music.',aspect:'16:9' as const,durationS:8,
      captions:lines.map((l,j)=>({atS:j*4,untilS:(j+1)*4,zh:l.tokens.map(t=>t.w).join(''),en:l.en,tokens:l.tokens}))};
  });
}
