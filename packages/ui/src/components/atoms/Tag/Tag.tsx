import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { Icon } from "../../../icons";
import { focusRing } from "../../../../lib/focus";
import { cn } from "../../../utils/cn";

const tagVariants = cva(
  "inline-flex items-center gap-200 rounded-200 px-200 py-200 font-sans text-03 leading-none font-normal",
  {
    variants: {
      scheme: {
        brand: "",
        neutral: "",
        positive: "",
        danger: "",
        warning: "",
      },
      variant: {
        primary: "",
        secondary: "",
      },
    },
    compoundVariants: [
      {
        scheme: "brand",
        variant: "primary",
        class: "bg-(--color-bg-brand) text-(--color-fg-on-brand) hover:bg-(--color-bg-brand-hover)",
      },
      {
        scheme: "brand",
        variant: "secondary",
        class:
          "bg-(--color-bg-brand-tertiary) text-(--color-fg-on-brand-tertiary) hover:bg-(--color-bg-brand-tertiary-hover)",
      },
      {
        scheme: "danger",
        variant: "primary",
        class: "bg-(--color-bg-danger) text-(--color-fg-on-danger) hover:bg-(--color-bg-danger-hover)",
      },
      {
        scheme: "danger",
        variant: "secondary",
        class:
          "bg-(--color-bg-danger-secondary) text-(--color-fg-on-danger-secondary) hover:bg-(--color-bg-danger-secondary-hover)",
      },
      {
        scheme: "positive",
        variant: "primary",
        class: "bg-(--color-bg-positive) text-(--color-fg-on-positive) hover:bg-(--color-bg-positive-hover)",
      },
      {
        scheme: "positive",
        variant: "secondary",
        class:
          "bg-(--color-bg-positive-secondary) text-(--color-fg-on-positive-secondary) hover:bg-(--color-bg-positive-secondary-hover)",
      },
      {
        scheme: "warning",
        variant: "primary",
        class: "bg-(--color-bg-warning) text-(--color-fg-on-warning) hover:bg-(--color-bg-warning-hover)",
      },
      {
        scheme: "warning",
        variant: "secondary",
        class:
          "bg-(--color-bg-warning-secondary) text-(--color-fg-on-warning-secondary) hover:bg-(--color-bg-warning-secondary-hover)",
      },
      {
        scheme: "neutral",
        variant: "primary",
        class:
          "bg-(--color-bg-default-tertiary) text-(--color-fg-default) hover:bg-(--color-bg-default-tertiary-hover)",
      },
      {
        scheme: "neutral",
        variant: "secondary",
        class:
          "bg-(--color-bg-default-secondary) text-(--color-fg-default) hover:bg-(--color-bg-default-secondary-hover)",
      },
    ],
    defaultVariants: {
      scheme: "brand",
      variant: "primary",
    },
  },
);

export type TagProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof tagVariants> & {
    onRemove?: () => void;
  };

export const Tag = ({ scheme, variant, className, children, onRemove, ...props }: TagProps) => (
  <span className={cn(tagVariants({ scheme, variant }), className)} {...props}>
    {children}
    {onRemove ? (
      <button type="button" aria-label="Remove" onClick={onRemove} className={cn("inline-flex", focusRing)}>
        <Icon name="x-small" aria-hidden />
      </button>
    ) : null}
  </span>
);

Tag.displayName = "Tag";
