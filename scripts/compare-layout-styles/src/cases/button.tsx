import { Button as EmotionButton } from "@dw/ui-emotion";
import { Button as TailwindButton } from "@dw/ui";
import type { LayoutCase } from "../case";

const variants = ["primary", "neutral", "subtle"] as const;
const sizes = ["medium", "small"] as const;

export const buttonCases: LayoutCase[] = variants.flatMap((variant) =>
  sizes.flatMap((size) =>
    [false, true].map((disabled) => ({
      id: ["button", variant, size, disabled ? "disabled" : "enabled"].join("/"),
      disabled,
      tailwind: (
        <TailwindButton variant={variant} size={size} disabled={disabled}>
          Label
        </TailwindButton>
      ),
      emotion: (
        <EmotionButton variant={variant} size={size} disabled={disabled}>
          Label
        </EmotionButton>
      ),
    })),
  ),
);
