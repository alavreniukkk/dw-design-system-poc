import { css, cx } from "@emotion/css";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "neutral" | "subtle";
type Size = "medium" | "small";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
    background-color: var(--color-bg-brand);
    color: var(--color-fg-on-brand);
    border-color: var(--color-border-brand);
    &:hover {
      background-color: var(--color-bg-brand-hover);
    }
  `,
  neutral: css`
    background-color: var(--color-bg-neutral-tertiary);
    color: var(--color-fg-default);
    border-color: var(--color-border-neutral-secondary);
    &:hover {
      background-color: var(--color-bg-neutral-tertiary-hover);
    }
  `,
  subtle: css`
    background-color: transparent;
    color: var(--color-fg-neutral);
    border-color: transparent;
    &:hover {
      color: var(--color-fg-default);
      border-color: var(--color-border-default);
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

export const Button = ({
  variant = "primary",
  size = "medium",
  type = "button",
  children,
  ...props
}: ButtonProps) => (
  <button type={type} className={cx(base, variants[variant], sizes[size])} {...props}>
    {children}
  </button>
);

Button.displayName = "Button";
