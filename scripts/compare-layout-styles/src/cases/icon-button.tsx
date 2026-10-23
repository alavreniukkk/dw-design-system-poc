import { IconButton as EmotionIconButton } from "@dw/ui-emotion";
import { IconButton as TailwindIconButton } from "@dw/ui";
import type { LayoutCase } from "../case";

const variants = ["primary", "neutral", "subtle"] as const;
const sizes = ["medium", "small"] as const;

export const iconButtonCases: LayoutCase[] = variants.flatMap((variant) =>
  sizes.flatMap((size) =>
    [false, true].map((disabled) => ({
      id: ["icon-button", variant, size, disabled ? "disabled" : "enabled"].join("/"),
      disabled,
      tailwind: (
        <TailwindIconButton icon="star" variant={variant} size={size} disabled={disabled}>
          Star
        </TailwindIconButton>
      ),
      emotion: (
        <EmotionIconButton icon="star" variant={variant} size={size} disabled={disabled}>
          Star
        </EmotionIconButton>
      ),
    })),
  ),
);
