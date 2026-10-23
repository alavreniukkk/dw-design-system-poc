import { createRoot } from "react-dom/client";
import "@dw/ui/styles.css";
import "./harness.css";
import type { LayoutCase } from "./case";
import { accordionCases } from "./cases/accordion";
import { avatarCases } from "./cases/avatar";
import { avatarBlockCases } from "./cases/avatar-block";
import { avatarGroupCases } from "./cases/avatar-group";
import { buttonCases } from "./cases/button";
import { buttonDangerCases } from "./cases/button-danger";
import { buttonGroupCases } from "./cases/button-group";
import { cardCases } from "./cases/card";
import { checkboxCases } from "./cases/checkbox";
import { iconButtonCases } from "./cases/icon-button";
import { inputCases } from "./cases/input";
import { notificationCases } from "./cases/notification";
import { radioCases } from "./cases/radio";
import { tagCases } from "./cases/tag";
import { tagToggleCases } from "./cases/tag-toggle";
import { tagToggleGroupCases } from "./cases/tag-toggle-group";
import { textareaCases } from "./cases/textarea";
import { typographyCases } from "./cases/typography";

const suites: LayoutCase[][] = [
  accordionCases,
  avatarCases,
  avatarBlockCases,
  avatarGroupCases,
  buttonCases,
  buttonDangerCases,
  buttonGroupCases,
  cardCases,
  checkboxCases,
  iconButtonCases,
  inputCases,
  notificationCases,
  radioCases,
  tagCases,
  tagToggleCases,
  tagToggleGroupCases,
  textareaCases,
  typographyCases,
];

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
      >
        <div data-impl="tailwind">{item.tailwind}</div>
        <div data-impl="emotion">{item.emotion}</div>
      </section>
    ))}
  </main>,
);
