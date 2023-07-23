import { describe, it, expect } from "vitest";
import AReact from "./AReact";

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

describe("Function Component", () => {
  it("should render Function Component", async () => {
    const container = document.createElement("div");
    function App() {
      return (
        <div id="foo">
          <div id="bar"></div>
          <button></button>
        </div>
      );
    }
    const root = AReact.createRoot(container);
    await AReact.act(() => {
      root.render(<App />);
      expect(container.innerHTML).toBe("");
    });
    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar"></div><button></button></div>'
    );
  });

  it("should render nested Function Component", async () => {
    const container = document.createElement("div");
    function App(props) {
      return (
        <div id="foo">
          <div id="bar">{props.title}</div>
          <button></button>
          {props.children}
        </div>
      );
    }
    const root = AReact.createRoot(container);
    await AReact.act(() => {
      root.render(
        <App title="main title">
          <App title="sub title" />
        </App>
      );
    });

    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar">main title</div><button></button><div id="foo"><div id="bar">sub title</div><button></button></div></div>'
    );
  });
});
