import { css, cx } from "@emotion/css";
import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@dw/ui/icons";
import { focusVisible } from "./css";

export type TagToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

const base = css`
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  border-radius: var(--radius-200);
  padding: var(--space-200);
  font-family: var(--font-sans);
  font-size: var(--font-size-03);
  line-height: 1;
  font-weight: var(--font-weight-regular);
`;

const on = css`
  background-color: var(--color-bg-brand);
  color: var(--color-fg-on-brand);
`;

const off = css`
  background-color: var(--color-bg-brand-tertiary);
  color: var(--color-fg-brand-tertiary);
`;

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
    className={cx(base, focusVisible, pressed ? on : off, className)}
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
