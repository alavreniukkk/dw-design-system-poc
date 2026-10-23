import { TagToggle as EmotionTagToggle } from "@dw/ui-emotion";
import { TagToggle as TailwindTagToggle } from "@dw/ui";
import type { LayoutCase } from "../case";

export const tagToggleCases: LayoutCase[] = [false, true].map((pressed) => ({
  id: ["tag-toggle", pressed ? "pressed" : "rest"].join("/"),
  tailwind: <TailwindTagToggle pressed={pressed}>Label</TailwindTagToggle>,
  emotion: <EmotionTagToggle pressed={pressed}>Label</EmotionTagToggle>,
}));
