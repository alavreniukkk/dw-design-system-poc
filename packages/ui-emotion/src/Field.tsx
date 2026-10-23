import { css, cx } from "@emotion/css";
import type { ReactNode } from "react";
import { Typography } from "./Typography";

export const fieldClass = css`
  display: flex;
  width: 100%;
  min-width: var(--space-0);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-200);
`;

export const controlClass = css`
  width: 100%;
  border-radius: var(--radius-200);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--color-border-default);
  background-color: var(--color-bg-default);
  padding-inline: var(--space-400);
  font-family: var(--font-sans);
  font-size: var(--font-size-03);
  line-height: 1;
  color: var(--color-fg-default);
  outline: none;
  &::placeholder {
    color: var(--color-fg-tertiary);
  }
  &:focus-visible {
    border-color: var(--color-border-brand);
  }
  &:disabled {
    cursor: not-allowed;
    border-color: var(--color-border-disabled);
    background-color: var(--color-bg-disabled);
    color: var(--color-fg-disabled);
  }
  &[aria-invalid="true"] {
    border-color: var(--color-border-danger);
  }
`;

export const controlHeight = css`
  height: var(--size-icon-large);
`;

export const textareaClass = css`
  height: calc(var(--spacing) * 20);
  padding-block: var(--space-300);
  line-height: 1.4;
`;

type FieldProps = {
  id: string;
  label?: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

export const Field = ({ id, label, description, className, children }: FieldProps) => (
  <div className={cx(fieldClass, className)}>
    {label ? (
      <Typography as="label" variant="body" htmlFor={id}>
        {label}
      </Typography>
    ) : null}
    {description ? (
      <Typography variant="body" tone="secondary">
        {description}
      </Typography>
    ) : null}
    {children}
  </div>
);

Field.displayName = "Field";
