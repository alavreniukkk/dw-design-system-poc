import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { focusRing } from "../../../styles/focus";
import { cn } from "../../../utils/cn";

const buttonVariants = cva(
  `relative inline-flex items-center justify-center rounded-200 border border-solid font-sans text-03 leading-none font-normal whitespace-nowrap hover:no-underline disabled:cursor-not-allowed disabled:border-(--color-border-disabled) disabled:bg-(--color-bg-disabled) disabled:text-(--color-fg-disabled-on) disabled:hover:border-(--color-border-disabled) disabled:hover:bg-(--color-bg-disabled) disabled:hover:text-(--color-fg-disabled-on) ${focusRing}`,
  {
    variants: {
      variant: {
        primary:
          "border-(--color-border-brand) bg-(--color-bg-brand) text-(--color-fg-on-brand) hover:bg-(--color-bg-brand-hover)",
        neutral:
          "border-(--color-border-neutral-secondary) bg-(--color-bg-neutral-tertiary) text-(--color-fg-default) hover:bg-(--color-bg-neutral-tertiary-hover)",
        subtle:
          "border-transparent bg-transparent text-(--color-fg-neutral) hover:border-(--color-border-default) hover:text-(--color-fg-default)",
      },
      size: {
        medium: "h-(--size-icon-large) px-300",
        small: "h-(--size-icon-medium) px-200",
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
