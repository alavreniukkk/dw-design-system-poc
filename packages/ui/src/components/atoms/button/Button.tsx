import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-button border-button font-button font-normal leading-none whitespace-nowrap hover:no-underline disabled:cursor-not-allowed disabled:border-button-disabled-border disabled:bg-button-disabled disabled:text-button-disabled-fg disabled:hover:border-button-disabled-border disabled:hover:bg-button-disabled disabled:hover:text-button-disabled-fg",
  {
    variants: {
      variant: {
        primary:
          "border-button-primary-border bg-button-primary text-button-primary-fg hover:bg-button-primary-hover",
        neutral:
          "border-button-neutral-border bg-button-neutral text-button-neutral-fg hover:bg-button-neutral-hover",
        subtle:
          "border-button-subtle-border bg-button-subtle text-button-subtle-fg hover:border-button-subtle-hover-border hover:text-button-subtle-hover-fg",
      },
      size: {
        medium: "h-button-medium px-button-x-medium py-button-y-medium text-button-medium",
        small: "h-button-small px-button-x-small py-button-y-small text-button-small",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = ({
  variant,
  size,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) => (
  <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props}>
    {children}
  </button>
);

Button.displayName = "Button";
