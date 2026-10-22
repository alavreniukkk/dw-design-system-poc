import type { ButtonHTMLAttributes } from "react";
import { Icon } from "../../../icons";
import { focusRing } from "../../../../lib/focus";
import { cn } from "../../../utils/cn";

export type TagToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

export const TagToggle = ({
  pressed = false,
  onPressedChange,
  className,
  children,
  type = "button",
  onClick,
  ...props
}: TagToggleProps) => (
  <button
    type={type}
    aria-pressed={pressed}
    className={cn(
      "inline-flex items-center gap-200 rounded-200 px-200 py-200 font-sans text-03 leading-none font-normal",
      focusRing,
      pressed
        ? "bg-(--color-bg-brand) text-(--color-fg-on-brand)"
        : "bg-(--color-bg-brand-tertiary) text-(--color-fg-brand-tertiary)",
      className,
    )}
    onClick={(event) => {
      onClick?.(event);
      if (!event.defaultPrevented) onPressedChange?.(!pressed);
    }}
    {...props}
  >
    {pressed ? <Icon name="check" aria-hidden /> : null}
    {children}
  </button>
);

TagToggle.displayName = "TagToggle";
