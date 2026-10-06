import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecreationHub } from "./RecreationHub";

vi.mock("@tanstack/react-router", () => ({ Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a> }));
vi.mock("@/components/drills/ToneCircuit", () => ({ ToneCircuit: ({ mode }: { mode: string }) => <div>Tone activity: {mode}</div> }));
vi.mock("@/components/park/RepertoireDrill", () => ({ RepertoireDrill: ({ mode }: { mode: string }) => <div>Word activity: {mode}</div> }));
afterEach(cleanup);

describe("Recreation hub", () => {
  it.each(["gym", "playground"] as const)("gives %s an independent town exit and reciprocal scene entrance", (room) => {
    render(<RecreationHub room={room} />);
    for (const link of screen.getAllByRole("link", { name: "Back to town" })) expect(link).toHaveAttribute("href", "/town");
    expect(screen.getByRole("link", { name: room === "gym" ? "Playground" : "Gym" })).toHaveAttribute("href", room === "gym" ? "/park" : "/gym");
  });
  it("opens the circuit from the scene and returns to the gym", async () => {
    render(<RecreationHub room="gym" />);
    fireEvent.click(screen.getByRole("button", { name: "Tone Circuit" }));
    expect(await screen.findByText("Tone activity: circuit")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to the gym" }));
    expect(screen.getByRole("heading", { name: "The gym" })).toBeInTheDocument();
  });
  it("opens a sentence listening drill from playground equipment", async () => {
    render(<RecreationHub room="playground" />);
    fireEvent.click(screen.getByRole("button", { name: "Speaking Tubes" }));
    expect(await screen.findByText("Word activity: sentence-pinyin")).toBeInTheDocument();
  });
});
