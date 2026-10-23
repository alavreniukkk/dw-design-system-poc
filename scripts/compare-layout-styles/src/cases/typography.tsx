import { Typography as EmotionTypography } from "@dw/ui-emotion";
import { Typography as TailwindTypography } from "@dw/ui";
import type { LayoutCase } from "../case";

const variants = [
  "title-hero",
  "title-page",
  "subtitle",
  "heading",
  "subheading",
  "body",
  "body-strong",
  "body-emphasis",
  "body-link",
  "body-small",
  "body-small-strong",
  "code",
  "body-single",
  "body-small-strong-single",
] as const;

const tones = [
  "default",
  "secondary",
  "tertiary",
  "brand",
  "brand-secondary",
  "brand-tertiary",
  "on-brand",
  "positive",
  "warning",
  "danger",
  "disabled",
  "neutral",
] as const;

export const typographyCases: LayoutCase[] = [
  ...variants.map((variant) => ({
    id: ["typography", variant].join("/"),
    tailwind: <TailwindTypography variant={variant}>Label</TailwindTypography>,
    emotion: <EmotionTypography variant={variant}>Label</EmotionTypography>,
  })),
  ...tones.map((tone) => ({
    id: ["typography", "tone", tone].join("/"),
    tailwind: (
      <TailwindTypography variant="body" tone={tone}>
        Label
      </TailwindTypography>
    ),
    emotion: (
      <EmotionTypography variant="body" tone={tone}>
        Label
      </EmotionTypography>
    ),
  })),
];
