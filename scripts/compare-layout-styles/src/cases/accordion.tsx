import { Accordion as EmotionAccordion } from "@dw/ui-emotion";
import { Accordion as TailwindAccordion } from "@dw/ui";
import type { LayoutCase } from "../case";

export const accordionCases: LayoutCase[] = [false, true].map((open) => ({
  id: ["accordion", open ? "open" : "closed"].join("/"),
  tailwind: (
    <TailwindAccordion title="Title" defaultOpen={open}>
      Body
    </TailwindAccordion>
  ),
  emotion: (
    <EmotionAccordion title="Title" defaultOpen={open}>
      Body
    </EmotionAccordion>
  ),
}));
