import { Button as EmotionButton } from "@dw/ui-emotion";
import { Button as TailwindButton } from "@dw/ui";
import type { LayoutCase } from "../case";

const variants = ["primary", "secondary", "tertiary"] as const;
const sizes = ["md", "sm"] as const;
const contents = ["text", "icon-text", "icon"] as const;
const brands = ["default", "acme"] as const;

export const buttonCases: LayoutCase[] = brands.flatMap((brand) =>
  variants.flatMap((variant) =>
    sizes.flatMap((size) =>
      contents.flatMap((content) =>
        [false, true].map((disabled) => ({
          id: ["button", brand, variant, size, content, disabled ? "disabled" : "enabled"].join("/"),
          brand: brand === "acme" ? "acme" : undefined,
          disabled,
          tailwind: (
            <TailwindButton variant={variant} size={size} content={content} disabled={disabled}>
              Label
            </TailwindButton>
          ),
          emotion: (
            <EmotionButton variant={variant} size={size} content={content} disabled={disabled}>
              Label
            </EmotionButton>
          ),
        })),
      ),
    ),
  ),
);
