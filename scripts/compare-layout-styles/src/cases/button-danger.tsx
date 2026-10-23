import { ButtonDanger as EmotionButtonDanger } from "@dw/ui-emotion";
import { ButtonDanger as TailwindButtonDanger } from "@dw/ui";
import type { LayoutCase } from "../case";

const variants = ["primary", "subtle"] as const;
const sizes = ["medium", "small"] as const;

export const buttonDangerCases: LayoutCase[] = variants.flatMap((variant) =>
  sizes.flatMap((size) =>
    [false, true].map((disabled) => ({
      id: ["button-danger", variant, size, disabled ? "disabled" : "enabled"].join("/"),
      disabled,
      tailwind: (
        <TailwindButtonDanger variant={variant} size={size} disabled={disabled}>
          Label
        </TailwindButtonDanger>
      ),
      emotion: (
        <EmotionButtonDanger variant={variant} size={size} disabled={disabled}>
          Label
        </EmotionButtonDanger>
      ),
    })),
  ),
);
