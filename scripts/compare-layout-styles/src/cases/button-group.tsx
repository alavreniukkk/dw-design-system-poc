import { Button as EmotionButton, ButtonGroup as EmotionButtonGroup } from "@dw/ui-emotion";
import { Button as TailwindButton, ButtonGroup as TailwindButtonGroup } from "@dw/ui";
import type { LayoutCase } from "../case";

const aligns = ["start", "end", "center", "justify", "stack"] as const;

export const buttonGroupCases: LayoutCase[] = aligns.map((align) => ({
  id: ["button-group", align].join("/"),
  tailwind: (
    <TailwindButtonGroup align={align}>
      <TailwindButton size="small">One</TailwindButton>
      <TailwindButton size="small" variant="neutral">
        Two
      </TailwindButton>
    </TailwindButtonGroup>
  ),
  emotion: (
    <EmotionButtonGroup align={align}>
      <EmotionButton size="small">One</EmotionButton>
      <EmotionButton size="small" variant="neutral">
        Two
      </EmotionButton>
    </EmotionButtonGroup>
  ),
}));
