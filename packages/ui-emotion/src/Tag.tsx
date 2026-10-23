import { css, cx } from "@emotion/css";
import type { HTMLAttributes } from "react";
import { Icon } from "@dw/ui/icons";
import { focusVisible } from "./css";

type Scheme = "brand" | "neutral" | "positive" | "danger" | "warning";
type Variant = "primary" | "secondary";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  scheme?: Scheme;
  variant?: Variant;
  onRemove?: () => void;
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

const remove = css`
  display: inline-flex;
`;

const paint = (background: string, color: string, hover: string) => css`
  background-color: var(${background});
  color: var(${color});
  &:hover {
    background-color: var(${hover});
  }
`;

const paints: Record<`${Scheme}-${Variant}`, string> = {
  "brand-primary": paint("--color-bg-brand", "--color-fg-on-brand", "--color-bg-brand-hover"),
  "brand-secondary": paint("--color-bg-brand-tertiary", "--color-fg-on-brand-tertiary", "--color-bg-brand-tertiary-hover"),
  "danger-primary": paint("--color-bg-danger", "--color-fg-on-danger", "--color-bg-danger-hover"),
  "danger-secondary": paint(
    "--color-bg-danger-secondary",
    "--color-fg-on-danger-secondary",
    "--color-bg-danger-secondary-hover",
  ),
  "positive-primary": paint("--color-bg-positive", "--color-fg-on-positive", "--color-bg-positive-hover"),
  "positive-secondary": paint(
    "--color-bg-positive-secondary",
    "--color-fg-on-positive-secondary",
    "--color-bg-positive-secondary-hover",
  ),
  "warning-primary": paint("--color-bg-warning", "--color-fg-on-warning", "--color-bg-warning-hover"),
  "warning-secondary": paint(
    "--color-bg-warning-secondary",
    "--color-fg-on-warning-secondary",
    "--color-bg-warning-secondary-hover",
  ),
  "neutral-primary": paint("--color-bg-default-tertiary", "--color-fg-default", "--color-bg-default-tertiary-hover"),
  "neutral-secondary": paint("--color-bg-default-secondary", "--color-fg-default", "--color-bg-default-secondary-hover"),
};

export const Tag = ({ scheme = "brand", variant = "primary", className, children, onRemove, ...props }: TagProps) => (
  <span className={cx(base, paints[`${scheme}-${variant}`], className)} {...props}>
    {children}
    {onRemove ? (
      <button type="button" aria-label="Remove" onClick={onRemove} className={cx(remove, focusVisible)}>
        <Icon name="x-small" aria-hidden />
      </button>
    ) : null}
  </span>
);

Tag.displayName = "Tag";
