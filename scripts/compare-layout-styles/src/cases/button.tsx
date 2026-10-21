import { Button as EmotionButton } from "@dw/ui-emotion";
import { Button as TailwindButton } from "@dw/ui";
import type { LayoutCase } from "../case";

const variants = ["primary", "neutral", "subtle"] as const;
const sizes = ["medium", "small"] as const;
const brands = ["default", "acme"] as const;

export const buttonCases: LayoutCase[] = brands.flatMap((brand) =>
  variants.flatMap((variant) =>
    sizes.flatMap((size) =>
      [false, true].map((disabled) => ({
        id: ["button", brand, variant, size, disabled ? "disabled" : "enabled"].join("/"),
        brand: brand === "acme" ? "acme" : undefined,
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
  ),
);
