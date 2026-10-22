import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { focusRing } from "../../../../lib/focus";
import { cn } from "../../../utils/cn";

const buttonDangerVariants = cva(
  `relative inline-flex items-center justify-center rounded-200 border border-solid font-sans text-03 leading-none font-normal whitespace-nowrap hover:no-underline disabled:cursor-not-allowed disabled:border-(--color-border-disabled) disabled:bg-(--color-bg-disabled) disabled:text-(--color-fg-disabled-on) disabled:hover:border-(--color-border-disabled) disabled:hover:bg-(--color-bg-disabled) disabled:hover:text-(--color-fg-disabled-on) ${focusRing}`,
  {
    variants: {
      variant: {
        primary:
          "border-(--color-border-danger-secondary) bg-(--color-bg-danger) text-(--color-fg-on-danger) hover:border-(--color-border-danger) hover:bg-(--color-bg-danger-hover)",
        subtle:
          "border-transparent bg-transparent text-(--color-fg-danger) hover:border-(--color-border-danger) hover:bg-(--color-bg-danger-tertiary-hover)",
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
  <button type={type} className={cn(buttonDangerVariants({ variant, size }), className)} {...props}>
    {children}
  </button>
);

ButtonDanger.displayName = "ButtonDanger";
