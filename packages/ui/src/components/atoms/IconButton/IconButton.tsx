import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../../../icons";
import { cn } from "../../../utils/cn";

const iconButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-icon-button border-icon-button disabled:cursor-not-allowed disabled:border-icon-button-disabled-border disabled:bg-icon-button-disabled disabled:text-icon-button-disabled-fg disabled:hover:border-icon-button-disabled-border disabled:hover:bg-icon-button-disabled disabled:hover:text-icon-button-disabled-fg",
  {
    variants: {
      variant: {
        primary:
          "border-icon-button-primary-border bg-icon-button-primary text-icon-button-primary-fg hover:bg-icon-button-primary-hover",
        neutral:
          "border-icon-button-neutral-border bg-icon-button-neutral text-icon-button-neutral-fg hover:bg-icon-button-neutral-hover",
        subtle:
          "border-icon-button-subtle-border bg-icon-button-subtle text-icon-button-subtle-fg hover:bg-icon-button-subtle-hover",
      },
      size: {
        medium:
          "h-icon-button-medium w-icon-button-medium px-icon-button-x-medium py-icon-button-y-medium",
        small:
          "h-icon-button-small w-icon-button-small px-icon-button-x-small py-icon-button-y-small",
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
  <button
    type={type}
    className={cn(iconButtonVariants({ variant, size }), className)}
    {...props}
  >
    <Icon name={icon} aria-hidden className="max-w-none shrink-0" />
    <span className="sr-only">{children}</span>
  </button>
);

IconButton.displayName = "IconButton";
