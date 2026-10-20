import { css, cx } from "@emotion/css";
import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@dw/ui/icons";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "md" | "sm";
type Content = "text" | "icon-text" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  content?: Content;
};

const base = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--btn-radius);
  border: 2px solid transparent;
  padding-top: var(--btn-pad-y);
  padding-bottom: var(--btn-pad-y);
  font-family: var(--btn-font);
  &:hover {
    text-decoration: none;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const variants = {
  primary: css`
    background-color: var(--btn-primary-bg);
    color: var(--btn-primary-fg);
    &:hover {
      background-color: var(--btn-primary-hover-bg);
    }
  `,
  secondary: css`
    background-color: var(--btn-secondary-bg);
    color: var(--btn-secondary-fg);
    border-color: var(--btn-secondary-border);
    &:hover {
      background-color: var(--btn-primary-bg);
      color: var(--btn-primary-fg);
      border-color: transparent;
    }
  `,
  tertiary: css`
    background-color: var(--btn-tertiary-bg);
    color: var(--btn-tertiary-fg);
    &:hover {
      background-color: var(--btn-tertiary-hover-bg);
    }
  `,
};

const iconBox = css`
  svg {
    width: var(--btn-icon);
    height: var(--btn-icon);
    flex-shrink: 0;
  }
`;

const iconGap = css`
  gap: var(--btn-gap);
`;

const hiddenLabel = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const sizes = {
  md: css`
    height: var(--btn-height-md);
    padding-left: var(--btn-pad-x-md);
    padding-right: var(--btn-pad-x-md);
    font-size: var(--btn-font-size-md);
  `,
  sm: css`
    height: var(--btn-height-sm);
    padding-left: var(--btn-pad-x-sm);
    padding-right: var(--btn-pad-x-sm);
    font-size: var(--btn-font-size-sm);
  `,
};

export const Button = ({
  variant = "primary",
  size = "md",
  content = "text",
  type = "button",
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cx(
      base,
      variants[variant],
      sizes[size],
      (content === "icon" || content === "icon-text") && iconBox,
      content === "icon-text" && iconGap,
    )}
    {...props}
  >
    {content === "icon" || content === "icon-text" ? (
      <Icon name="plus" aria-hidden="true" />
    ) : null}
    {content === "icon" ? <span className={hiddenLabel}>{children}</span> : children}
  </button>
);

Button.displayName = "Button";
