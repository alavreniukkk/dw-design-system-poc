import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../../../icons";
import { focusRing } from "../../../../lib/focus";
import { cn } from "../../../utils/cn";

const iconButtonVariants = cva(
  `relative inline-flex items-center justify-center rounded-full border border-solid disabled:cursor-not-allowed disabled:border-(--color-border-disabled) disabled:bg-(--color-bg-disabled) disabled:text-(--color-fg-disabled-on) disabled:hover:border-(--color-border-disabled) disabled:hover:bg-(--color-bg-disabled) disabled:hover:text-(--color-fg-disabled-on) ${focusRing}`,
  {
    variants: {
      variant: {
        primary:
          "border-(--color-border-brand) bg-(--color-bg-brand) text-(--color-fg-on-brand) hover:bg-(--color-bg-brand-hover)",
        neutral:
          "border-(--color-border-default) bg-(--color-bg-default-secondary) text-(--color-fg-default) hover:bg-(--color-bg-default-secondary-hover)",
        subtle:
          "border-transparent bg-transparent text-(--color-fg-default) hover:bg-(--color-bg-default-hover)",
      },
      size: {
        medium: "size-(--size-icon-button-medium)",
        small: "size-(--size-icon-button-small)",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants> & {
    icon: IconName;
  };

export const IconButton = ({
  icon,
  variant,
  size,
  className,
  type = "button",
  children,
  ...props
}: IconButtonProps) => (
  <button type={type} className={cn(iconButtonVariants({ variant, size }), className)} {...props}>
    <Icon name={icon} aria-hidden className="max-w-none shrink-0" />
    <span className="sr-only">{children}</span>
  </button>
);

IconButton.displayName = "IconButton";
