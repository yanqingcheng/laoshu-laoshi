import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonGamePlayer } from "./LessonGamePlayer";

afterEach(cleanup);
const html = '<!doctype html><html><head></head><body></body></html>';
const data = { tokens: [{ w: "猫", p: "mao1" }] };

describe("LessonGamePlayer", () => {
  it("ignores foreign windows and invalid speech, accepts the current frame, and remounts for changed data", () => {
    const ready = vi.fn(), done = vi.fn(), say = vi.fn();
    const view = render(<LessonGamePlayer html={html} data={data} onReady={ready} onDone={done} onSay={say} />);
    const frame = screen.getByTitle("Lesson game") as HTMLIFrameElement;
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    const message = (source: Window | null, payload: unknown) => act(() => { window.dispatchEvent(new MessageEvent("message", { source, data: payload })); });
    message(window, { type: "ready" });
    expect(ready).not.toHaveBeenCalled();
    message(frame.contentWindow, { type: "done", score: 5 });
    expect(done).not.toHaveBeenCalled();
    message(frame.contentWindow, { type: "ready" });
    expect(ready).toHaveBeenCalledTimes(1);
    message(frame.contentWindow, { type: "say", w: "狗" });
    expect(say).not.toHaveBeenCalled();
    message(frame.contentWindow, { type: "say", w: "猫" });
    expect(say).toHaveBeenCalledWith("猫");
    message(frame.contentWindow, { type: "done", score: 12 });
    expect(done).toHaveBeenCalledWith(12);
    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(screen.getByTitle("Lesson game")).not.toBe(frame);
    const second = screen.getByTitle("Lesson game");
    view.rerender(<LessonGamePlayer html={html} data={{ tokens: [{ w: "狗", p: "gou3" }] }} />);
    expect(screen.getByTitle("Lesson game")).not.toBe(second);
  });
});
