import { describe, expect, it, vi } from "vitest";
vi.mock("@/components/WordText", () => ({ WordText: () => null }));
import { gameReducer, initialGameState } from "./DemoPackGame";

describe("prepared panda game", () => {
  it("bounds movement, blocks rocks, and only collects the requested object", () => {
    const blocked = gameReducer({ ...initialGameState, x: 1, y: 1 }, { type: "move", dx: 1, dy: 0 });
    expect(blocked.x).toBe(1);
    expect(gameReducer({ ...initialGameState, x: 0 }, { type: "move", dx: -1, dy: 0 }).x).toBe(0);
    const wrong = gameReducer({ ...initialGameState, x: 6, y: 0 }, { type: "collect" });
    expect(wrong.round).toBe(0);
    expect(wrong.mistakes).toBe(1);
    expect(gameReducer(initialGameState, { type: "collect" }).round).toBe(0);
    expect(gameReducer({ ...initialGameState, x: 0, y: 0 }, { type: "collect" }).round).toBe(1);
  });
  it("finishes all four rounds and restarts with a different order", () => {
    let state = initialGameState;
    for (const [x, y] of [[0, 0], [6, 4], [6, 0], [0, 4]]) state = gameReducer({ ...state, x, y }, { type: "collect" });
    expect(state.round).toBe(4);
    expect(gameReducer(state, { type: "collect" }).round).toBe(4);
    const restarted = gameReducer(state, { type: "restart" });
    expect(restarted.round).toBe(0);
    expect(restarted.order).not.toEqual(initialGameState.order);
    expect([restarted.x, restarted.y]).toEqual([3, 2]);
  });
});
