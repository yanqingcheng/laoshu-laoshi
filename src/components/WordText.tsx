import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toMarked } from "@/lib/chinese/pinyin";
import { alignWord } from "@/lib/chinese/ruby";
import { useServerFn } from "@tanstack/react-start";
import { addToMyWords } from "@/lib/app.functions";

export interface WTToken {
  w: string;
  id?: string;
  p?: string;
  name?: boolean;
  punct?: boolean;
}
export interface LexEntry {
  hanzi: string;
  pinyin: string;
  meaning: string;
  known?: boolean;
}

/** Group punctuation with the word before it so lines never start with it. */
function group(tokens: WTToken[]) {
  const out: { word: WTToken; trail: string }[] = [];
  for (const t of tokens) {
    if (t.punct && out.length) out[out.length - 1].trail += t.w;
    else out.push({ word: t, trail: "" });
  }
  return out;
}

export function WordText({
  tokens,
  lexicon = {},
  size = "lg",
  pinyin = true,
  targetId,
  hideTarget,
  tappable = true,
  markUnknown = false,
  className = "",
}: {
  tokens: WTToken[];
  lexicon?: Record<string, LexEntry>;
  size?: "lg" | "md" | "sm";
  pinyin?: boolean;
  targetId?: string;
  hideTarget?: boolean;
  tappable?: boolean;
  markUnknown?: boolean;
  className?: string;
}) {
  return (
    <span className={`wt wt-size-${size} ${pinyin ? "" : "wt-nopy"} ${className}`} lang="zh-CN">
      {group(tokens).map(({ word, trail }, i) => {
        const lex = word.id ? lexicon[word.id] : undefined;
        const reading = word.punct ? "" : lex?.pinyin ?? word.p ?? "";
        const segs = word.punct ? [{ han: word.w, py: "" }] : alignWord(word.w, reading).segs;
        const isTarget = !!targetId && word.id === targetId;
        const hidden = isTarget && hideTarget;
        const unknown = markUnknown && !word.punct && !word.name && !lex?.known;
        const cls = `wt-word ${isTarget ? (hidden ? "wt-hidden" : "wt-target") : ""} ${unknown ? "wt-unknown" : ""}`;
        const body = (
          <>
            <span className="wt-cols" aria-label={pinyin && reading ? `${word.w} (${toMarked(reading)})` : undefined}>
              {segs.map((g, k) => (
                <span key={k} className="wt-col">
                  <span className="wt-py" aria-hidden="true">{hidden ? "\u00a0" : g.py || "\u00a0"}</span>
                  <span className="han">{hidden ? "\u3000".repeat([...g.han].length) : g.han}</span>
                </span>
              ))}
            </span>
            {trail && (
              <span className="wt-col wt-punct">
                <span className="wt-py" aria-hidden="true">{"\u00a0"}</span>
                <span className="han">{trail}</span>
              </span>
            )}
          </>
        );
        if (!tappable || !lex || hidden || isTarget) return <span key={i} className={cls}>{body}</span>;
        return <TapWord key={i} cls={cls} lex={lex} wordId={word.id!}>{body}</TapWord>;
      })}
    </span>
  );
}

function TapWord({ cls, lex, wordId, children }: { cls: string; lex: LexEntry; wordId: string; children: React.ReactNode }) {
  const add = useServerFn(addToMyWords);
  const [state, setState] = useState<"idle" | "saving" | "added" | "error">("idle");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span role="button" tabIndex={0} className={`${cls} wt-tap`} aria-label={`${lex.hanzi}: ${lex.meaning}`}>
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-60 paper-card">
        <div className="text-3xl" style={{ fontFamily: "var(--font-han)" }}>{lex.hanzi}</div>
        <div className="text-sm font-semibold text-muted-foreground">{toMarked(lex.pinyin)}</div>
        <div className="mt-1 text-sm">{lex.meaning}</div>
        {!lex.known && (
          <button
            className="mt-3 text-sm font-semibold text-primary underline disabled:opacity-50"
            disabled={state === "saving" || state === "added"}
            onClick={async () => {
              setState("saving");
              try {
                await add({ data: { wordId } });
                setState("added");
              } catch {
                setState("error");
              }
            }}
          >
            {state === "added" ? "Added to my words" : state === "error" ? "Could not add — retry" : "Add to my words"}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
