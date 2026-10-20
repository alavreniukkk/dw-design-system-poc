import { createRoot } from "react-dom/client";
import "@dw/ui/styles.css";
import "../../../web/uk/acme/src/styles/brand.css";
import "./harness.css";
import type { LayoutCase } from "./case";
import { buttonCases } from "./cases/button";

const suites: LayoutCase[][] = [buttonCases];

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing #root");
}

createRoot(root).render(
  <main>
    {suites.flat().map((item) => (
      <section
        key={item.id}
        data-case={item.id}
        data-disabled={item.disabled ? "true" : "false"}
        data-brand={item.brand}
      >
        <div data-impl="tailwind">{item.tailwind}</div>
        <div data-impl="emotion">{item.emotion}</div>
      </section>
    ))}
  </main>,
);
