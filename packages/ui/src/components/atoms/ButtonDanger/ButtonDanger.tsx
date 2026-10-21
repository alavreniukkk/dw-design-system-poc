import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

const buttonDangerVariants = cva(
  "relative inline-flex items-center justify-center rounded-button-danger border-button-danger font-button-danger font-normal leading-none whitespace-nowrap hover:no-underline disabled:cursor-not-allowed disabled:border-button-danger-disabled-border disabled:bg-button-danger-disabled disabled:text-button-danger-disabled-fg disabled:hover:border-button-danger-disabled-border disabled:hover:bg-button-danger-disabled disabled:hover:text-button-danger-disabled-fg",
  {
    variants: {
      variant: {
        primary:
          "border-button-danger-primary-border bg-button-danger-primary text-button-danger-primary-fg hover:border-button-danger-primary-hover-border hover:bg-button-danger-primary-hover",
        subtle:
          "border-button-danger-subtle-border bg-button-danger-subtle text-button-danger-subtle-fg hover:border-button-danger-subtle-hover-border hover:bg-button-danger-subtle-hover",
      },
      size: {
        medium:
          "h-button-danger-medium px-button-danger-x-medium py-button-danger-y-medium text-button-danger-medium",
        small:
          "h-button-danger-small px-button-danger-x-small py-button-danger-y-small text-button-danger-small",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

export type ButtonDangerProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonDangerVariants>;

export const ButtonDanger = ({
  variant,
  size,
  className,
  type = "button",
  children,
  ...props
}: ButtonDangerProps) => (
  <button
    type={type}
    className={cn(buttonDangerVariants({ variant, size }), className)}
    {...props}
  >
    {children}
  </button>
);

ButtonDanger.displayName = "ButtonDanger";
