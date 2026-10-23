import { TagToggle as EmotionTagToggle, TagToggleGroup as EmotionTagToggleGroup } from "@dw/ui-emotion";
import { TagToggle as TailwindTagToggle, TagToggleGroup as TailwindTagToggleGroup } from "@dw/ui";
import type { LayoutCase } from "../case";

export const tagToggleGroupCases: LayoutCase[] = [
  {
    id: "tag-toggle-group/rest",
    tailwind: (
      <TailwindTagToggleGroup>
        <TailwindTagToggle pressed>One</TailwindTagToggle>
        <TailwindTagToggle>Two</TailwindTagToggle>
      </TailwindTagToggleGroup>
    ),
    emotion: (
      <EmotionTagToggleGroup>
        <EmotionTagToggle pressed>One</EmotionTagToggle>
        <EmotionTagToggle>Two</EmotionTagToggle>
      </EmotionTagToggleGroup>
    ),
  },
];
