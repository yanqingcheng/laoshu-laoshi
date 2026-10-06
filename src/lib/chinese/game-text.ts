import pinyinSource from "./pinyin.ts?raw";

// Bundle the existing pure conversion functions, not a second pinyin algorithm.
// The narrow extraction deliberately fails if the source boundary changes.
const start = pinyinSource.indexOf("const MARKS:");
const end = pinyinSource.indexOf("export function tonesOf");
if (start < 0 || end <= start) throw new Error("Game text core needs rebuilding after a pinyin source change");
const core = pinyinSource.slice(start, end)
  .replace(/\r\n/g, "\n")
  .replace("const MARKS: Record<string, string[]>", "const MARKS")
  .replace(/export function (\w+)\((syl|numbered): string\): string/g, "function $1($2)");

/** Trusted DOM adapter: native ruby, whole-word wrapping and isolated text metrics. */
export const GAME_TEXT_SCRIPT = `(()=>{'use strict';
${core}
function render(tokens, options={}) {
 if(!Array.isArray(tokens)) throw new TypeError('Expected checked token array');
 const mode=options.pinyin||'marked';
 if(!['marked','unmarked','hidden'].includes(mode)) throw new TypeError('Invalid pinyin mode');
 const host=document.createElement('span');host.lang='zh-CN';host.dataset.laoshuText='1';
 const shadow=host.attachShadow({mode:'open'}),style=document.createElement('style');
 style.textContent=':host{display:inline!important;font-family:system-ui,sans-serif!important;font-size:28px!important;line-height:2.1!important;letter-spacing:normal!important;white-space:normal!important;overflow:visible!important}.word{display:inline-block;white-space:nowrap;vertical-align:baseline;font-size:28px;line-height:2.1;margin-inline-end:.12em}ruby{display:ruby;ruby-position:over;font-size:28px;line-height:2.1}rt{display:ruby-text;font-size:14px;font-weight:400;line-height:1.2;text-align:center}.punct{font-size:28px}';
 shadow.append(style);let previous;
 for(const token of tokens) {
  if(!token||typeof token.w!=='string') throw new TypeError('Malformed token');
  if(token.p!==undefined&&(typeof token.p!=='string'||!/^[a-zü:]+[0-5](?: [a-zü:]+[0-5])*$/i.test(token.p))) throw new TypeError('Malformed reading');
  if(!token.p&&/^[\\p{P}\\s]+$/u.test(token.w)&&previous){const punctuation=document.createElement('span');punctuation.className='punct';punctuation.textContent=token.w;previous.append(punctuation);continue;}
  const word=document.createElement('span');word.className='word';
  if(token.p&&mode!=='hidden'){const ruby=document.createElement('ruby'),rt=document.createElement('rt');ruby.textContent=token.w;rt.textContent=mode==='marked'?toMarked(token.p):toUnmarked(token.p);ruby.append(rt);word.append(ruby);}else word.textContent=token.w;
  shadow.append(word);previous=word;
 }
 return host;
}
Object.defineProperty(window,'LaoshuText',{value:Object.freeze({render}),writable:false,configurable:false});
})();`;

export const GAME_TEXT_VERSION = "native-ruby-shared-pinyin-v1";
