import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "button-medium",
            "button-small",
            "button-danger-medium",
            "button-danger-small",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "button-primary-fg",
            "button-neutral-fg",
            "button-subtle-fg",
            "button-subtle-hover-fg",
            "button-disabled-fg",
            "button-danger-primary-fg",
            "button-danger-subtle-fg",
            "button-danger-disabled-fg",
            "icon-button-primary-fg",
            "icon-button-neutral-fg",
            "icon-button-subtle-fg",
            "icon-button-disabled-fg",
          ],
        },
      ],
      "border-w": [{ border: ["button", "button-danger", "icon-button"] }],
      "border-color": [
        {
          border: [
            "button-primary-border",
            "button-neutral-border",
            "button-subtle-border",
            "button-subtle-hover-border",
            "button-disabled-border",
            "button-danger-primary-border",
            "button-danger-primary-hover-border",
            "button-danger-subtle-border",
            "button-danger-subtle-hover-border",
            "button-danger-disabled-border",
            "icon-button-primary-border",
            "icon-button-neutral-border",
            "icon-button-subtle-border",
            "icon-button-disabled-border",
          ],
        },
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
