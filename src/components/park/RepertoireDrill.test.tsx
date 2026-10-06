import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RepertoireDrill } from "./RepertoireDrill";

const word = { id: "hello", hanzi: "你好", pinyin: "ni3 hao3", meaning: "hello", altReadings: [] };
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/app.functions", () => ({ addToMyWords: vi.fn() }));
vi.mock("@/lib/park/drills.functions", () => ({
  getDrillMaterial: vi.fn(async () => ({ words: [word], sentences: [{ id: "sentence:hello", word, sentenceId: "sentence", tokens: [{ w: "你好", id: "hello", p: "ni3 hao3" }, { w: "你好", id: "hello", p: "ni3 hao3" }] }], speechConfigured: false })),
  getDrillAudio: vi.fn(),
}));
afterEach(cleanup);

function show(mode: "see-tones" | "sentence-pinyin") {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><RepertoireDrill mode={mode} onBack={vi.fn()} /></QueryClientProvider>);
}

describe("repertoire drill UI", () => {
  it("hides all reading pinyin until checking and only advances on Next", async () => {
    const { container } = show("see-tones");
    const input = await screen.findByLabelText("Tone numbers");
    expect(container.textContent).not.toContain("nǐ");
    fireEvent.change(input, { target: { value: "33" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("That’s right!")).toBeInTheDocument();
    expect(container.textContent).toContain("nǐ");
    expect(screen.getByText("Round 1 of 10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next round" }));
    expect(screen.getByText("Round 2 of 10")).toBeInTheDocument();
    expect(container.textContent).not.toContain("nǐ");
  });
  it("keeps repeated sentence targets hidden and cannot grade unheard audio", async () => {
    const { container } = show("sentence-pinyin");
    const input = await screen.findByLabelText("Pinyin");
    await waitFor(() => expect(screen.getByText(/Practice audio is not configured/)).toBeInTheDocument());
    expect(container.textContent).not.toContain("nǐ");
    expect(container.querySelectorAll(".wt-tap")).toHaveLength(0);
    fireEvent.change(input, { target: { value: "ni3 hao3" } });
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
  });
});
