import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { Icon } from "../../../icons";
import { cn } from "../../../utils/cn";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-btn border-btn border-transparent py-btn-y font-btn hover:no-underline disabled:cursor-not-allowed disabled:opacity-btn-disabled",
  {
    variants: {
      variant: {
        primary: "bg-btn-primary text-btn-primary-fg hover:bg-btn-primary-hover",
        secondary:
          "border-btn-secondary-border bg-btn-secondary text-btn-secondary-fg hover:border-transparent hover:bg-btn-primary hover:text-btn-primary-fg",
        tertiary:
          "bg-btn-tertiary text-btn-tertiary-fg hover:bg-btn-tertiary-hover",
        ghost: "bg-btn-ghost text-btn-ghost-fg hover:bg-btn-ghost-hover",
      },
      size: {
        md: "h-btn-md px-btn-x-md text-btn-md",
        sm: "h-btn-sm px-btn-x-sm text-btn-sm",
      },
      content: {
        text: "",
        "icon-text": "gap-btn-gap",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      content: "text",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = ({
  variant,
  size,
  content,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(buttonVariants({ variant, size, content }), className)}
    {...props}
  >
    {content === "icon" || content === "icon-text" ? (
      <Icon name="plus" className="size-btn-icon shrink-0" aria-hidden />
    ) : null}
    {content === "icon" ? <span className="sr-only">{children}</span> : children}
  </button>
);

Button.displayName = "Button";
