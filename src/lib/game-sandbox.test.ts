import { describe, expect, it } from "vitest";
import { acceptedGameMessage, assembleGamePage, GAME_CSP, gameSpeechWords } from "./game-sandbox";
import { GAME_TEXT_SCRIPT } from "./chinese/game-text";

describe("Game sandbox boundary", () => {
  it("places exact CSP first, before trusted toolkit and generated script", () => {
    const source = '<!doctype html><html><head><title>Example</title></head><body><script>window.example=1</script></body></html>';
    const assembled = assembleGamePage(source);
    const doc = new DOMParser().parseFromString(assembled, "text/html");
    expect(doc.head.firstElementChild?.getAttribute("http-equiv")).toBe("Content-Security-Policy");
    expect(doc.head.firstElementChild?.getAttribute("content")).toBe(GAME_CSP);
    expect(doc.querySelectorAll("script")[0].textContent).toBe(GAME_TEXT_SCRIPT);
    expect(doc.querySelectorAll("script")[1].textContent).toBe("window.example=1");
  });
  it("rejects executable preambles and literal Chinese", () => {
    expect(() => assembleGamePage('<script>alert(1)</script><html><head></head></html>')).toThrow();
    expect(() => assembleGamePage('<html><head></head><body>猫</body></html>')).toThrow();
    expect(() => assembleGamePage('<html><head><meta http-equiv="refresh" content="0"></head></html>')).toThrow();
  });
  it("only accepts whitelisted messages, exact word tokens and integer scores", () => {
    const words = gameSpeechWords({ rounds: [{ tokens: [{ w: "猫", p: "mao1" }, { w: "。" }] }] });
    expect([...words]).toEqual(["猫"]);
    expect(acceptedGameMessage({ type: "say", w: "猫" }, words)).toEqual({ type: "say", w: "猫" });
    expect(acceptedGameMessage({ type: "say", w: "猫。" }, words)).toBeNull();
    expect(acceptedGameMessage({ type: "done", score: 1.5 }, words)).toBeNull();
    expect(acceptedGameMessage({ type: "evidence", score: 10 }, words)).toBeNull();
    expect(acceptedGameMessage({ type: "done", score: 10 }, words)).toEqual({ type: "done", score: 10 });
  });
});

describe("Trusted game text adapter", () => {
  it("uses the app pinyin core, preserves safe text and supports all modes", () => {
    const gameWindow = { document } as unknown as Window & { LaoshuText: { render: (tokens: unknown[], options?: { pinyin: string }) => HTMLElement } };
    new Function("window", "document", GAME_TEXT_SCRIPT)(gameWindow, document);
    const tokens = [{ w: "女儿", p: "nu:3 er2" }, { w: "。" }, { w: "<img src=x>" }];
    const marked = gameWindow.LaoshuText.render(tokens);
    expect(marked.shadowRoot?.querySelector("rt")?.textContent).toBe("nǚ ér");
    expect(marked.shadowRoot?.querySelector("img")).toBeNull();
    expect(marked.shadowRoot?.textContent).toContain("<img src=x>");
    expect(gameWindow.LaoshuText.render(tokens, { pinyin: "unmarked" }).shadowRoot?.querySelector("rt")?.textContent).toBe("nü er");
    expect(gameWindow.LaoshuText.render(tokens, { pinyin: "hidden" }).shadowRoot?.querySelector("rt")).toBeNull();
    expect(() => gameWindow.LaoshuText.render([{ w: "猫", p: "bogus" }])).toThrow();
    expect(Object.isFrozen(gameWindow.LaoshuText)).toBe(true);
  });
});
