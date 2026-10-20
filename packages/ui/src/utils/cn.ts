import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["btn-md", "btn-sm"] }],
      "text-color": [
        { text: ["btn-primary-fg", "btn-secondary-fg", "btn-tertiary-fg", "btn-ghost-fg"] },
      ],
      "border-w": [{ border: ["btn"] }],
      "border-color": [{ border: ["btn-secondary-border"] }],
      opacity: [{ opacity: ["btn-disabled"] }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
