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
  border-radius: var(--button-radius);
  border-width: var(--button-border-width);
  border-style: solid;
  font-family: var(--button-font);
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  &:hover {
    text-decoration: none;
  }
  &:disabled,
  &:disabled:hover {
    cursor: not-allowed;
    background-color: var(--button-disabled-bg);
    color: var(--button-disabled-fg);
    border-color: var(--button-disabled-border);
  }
`;

const variants = {
  primary: css`
    background-color: var(--button-primary-bg);
    color: var(--button-primary-fg);
    border-color: var(--button-primary-border);
    &:hover {
      background-color: var(--button-primary-hover-bg);
    }
  `,
  neutral: css`
    background-color: var(--button-neutral-bg);
    color: var(--button-neutral-fg);
    border-color: var(--button-neutral-border);
    &:hover {
      background-color: var(--button-neutral-hover-bg);
    }
  `,
  subtle: css`
    background-color: var(--button-subtle-bg);
    color: var(--button-subtle-fg);
    border-color: var(--button-subtle-border);
    &:hover {
      color: var(--button-subtle-hover-fg);
      border-color: var(--button-subtle-hover-border);
    }
  `,
};

const sizes = {
  medium: css`
    height: var(--button-height-medium);
    padding-left: var(--button-pad-x-medium);
    padding-right: var(--button-pad-x-medium);
    padding-top: var(--button-pad-y-medium);
    padding-bottom: var(--button-pad-y-medium);
    font-size: var(--button-font-size-medium);
  `,
  small: css`
    height: var(--button-height-small);
    padding-left: var(--button-pad-x-small);
    padding-right: var(--button-pad-x-small);
    padding-top: var(--button-pad-y-small);
    padding-bottom: var(--button-pad-y-small);
    font-size: var(--button-font-size-small);
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
