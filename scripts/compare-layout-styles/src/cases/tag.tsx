import { Tag as EmotionTag } from "@dw/ui-emotion";
import { Tag as TailwindTag } from "@dw/ui";
import type { LayoutCase } from "../case";

const schemes = ["brand", "neutral", "positive", "danger", "warning"] as const;
const variants = ["primary", "secondary"] as const;

export const tagCases: LayoutCase[] = [
  ...schemes.flatMap((scheme) =>
    variants.map((variant) => ({
      id: ["tag", scheme, variant].join("/"),
      tailwind: (
        <TailwindTag scheme={scheme} variant={variant}>
          Label
        </TailwindTag>
      ),
      emotion: (
        <EmotionTag scheme={scheme} variant={variant}>
          Label
        </EmotionTag>
      ),
    })),
  ),
  {
    id: "tag/brand/primary/remove",
    tailwind: (
      <TailwindTag scheme="brand" variant="primary" onRemove={() => undefined}>
        Label
      </TailwindTag>
    ),
    emotion: (
      <EmotionTag scheme="brand" variant="primary" onRemove={() => undefined}>
        Label
      </EmotionTag>
    ),
  },
];
