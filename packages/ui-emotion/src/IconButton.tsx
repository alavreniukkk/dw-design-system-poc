import { css, cx } from "@emotion/css";
import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "@dw/ui/icons";
import { focusVisible, iconFit, srOnly } from "./css";

type Variant = "primary" | "neutral" | "subtle";
type Size = "medium" | "small";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  variant?: Variant;
  size?: Size;
};

const base = css`
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border-width: var(--border-width-default);
  border-style: solid;
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
    background-color: var(--color-bg-default-secondary);
    color: var(--color-fg-default);
    border-color: var(--color-border-default);
    &:hover {
      background-color: var(--color-bg-default-secondary-hover);
    }
  `,
  subtle: css`
    background-color: transparent;
    color: var(--color-fg-default);
    border-color: transparent;
    &:hover {
      background-color: var(--color-bg-default-hover);
    }
  `,
};

const sizes = {
  medium: css`
    width: var(--size-icon-button-medium);
    height: var(--size-icon-button-medium);
  `,
  small: css`
    width: var(--size-icon-button-small);
    height: var(--size-icon-button-small);
  `,
};

export const IconButton = ({
  icon,
  variant = "primary",
  size = "medium",
  className,
  type = "button",
  children,
  ...props
}: IconButtonProps) => (
  <button type={type} className={cx(base, focusVisible, variants[variant], sizes[size], className)} {...props}>
    <Icon name={icon} aria-hidden className={iconFit} />
    <span className={srOnly}>{children}</span>
  </button>
);

IconButton.displayName = "IconButton";
