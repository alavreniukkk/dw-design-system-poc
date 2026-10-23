import { css, cx } from "@emotion/css";
import type { ButtonHTMLAttributes } from "react";
import { focusVisible } from "./css";

type Variant = "primary" | "subtle";
type Size = "medium" | "small";

export type ButtonDangerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base = css`
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-200);
  border-width: var(--border-width-default);
  border-style: solid;
  font-family: var(--font-sans);
  font-weight: var(--font-weight-regular);
  font-size: var(--font-size-03);
  line-height: 1;
  white-space: nowrap;
  &:hover {
    text-decoration: none;
  }
  &:disabled,
  &:disabled:hover {
    cursor: not-allowed;
    background-color: var(--color-bg-disabled);
    color: var(--color-fg-disabled-on);
    border-color: var(--color-border-disabled);
  }
`;

const variants = {
  primary: css`
    background-color: var(--color-bg-danger);
    color: var(--color-fg-on-danger);
    border-color: var(--color-border-danger-secondary);
    &:hover {
      background-color: var(--color-bg-danger-hover);
      border-color: var(--color-border-danger);
    }
  `,
  subtle: css`
    background-color: transparent;
    color: var(--color-fg-danger);
    border-color: transparent;
    &:hover {
      background-color: var(--color-bg-danger-tertiary-hover);
      border-color: var(--color-border-danger);
    }
  `,
};

const sizes = {
  medium: css`
    height: var(--size-icon-large);
    padding-left: var(--space-300);
    padding-right: var(--space-300);
  `,
  small: css`
    height: var(--size-icon-medium);
    padding-left: var(--space-200);
    padding-right: var(--space-200);
  `,
};

export const ButtonDanger = ({
  variant = "primary",
  size = "medium",
  className,
  type = "button",
  children,
  ...props
}: ButtonDangerProps) => (
  <button type={type} className={cx(base, focusVisible, variants[variant], sizes[size], className)} {...props}>
    {children}
  </button>
);

ButtonDanger.displayName = "ButtonDanger";
