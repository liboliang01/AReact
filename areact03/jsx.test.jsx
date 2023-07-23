import { describe, it, expect } from "vitest";
import AReact from "./AReact";

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

describe("AReact Concurrent", () => {
  it("should render in async", async () => {
    const container = document.createElement("div");
    const element = (
      <div id="foo">
        <div id="bar"></div>
        <button></button>
      </div>
    );
    const root = AReact.createRoot(container);
    root.render(element);
    expect(container.innerHTML).toBe("");
    await sleep(1000);
    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar"></div><button></button></div>'
    );
  });

  it("should render in act", async () => {
    const container = document.createElement("div");
    const element = (
      <div id="foo">
        <div id="bar"></div>
        <button></button>
      </div>
    );
    const root = AReact.createRoot(container);
    await AReact.act(() => {
      root.render(element);
      expect(container.innerHTML).toBe("");
    });
    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar"></div><button></button></div>'
    );
  });
});
