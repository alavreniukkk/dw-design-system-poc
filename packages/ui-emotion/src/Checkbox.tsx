import { css, cx } from "@emotion/css";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "@dw/ui/icons";
import { srOnly } from "./css";
import { Typography } from "./Typography";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
};

const stack = css`
  display: flex;
  flex-direction: column;
`;

const row = css`
  display: inline-flex;
  align-items: center;
  gap: var(--space-300);
`;

const box = css`
  position: relative;
  display: inline-flex;
  width: var(--space-400);
  height: var(--space-400);
  align-items: center;
  justify-content: center;
  & > input:checked + span {
    border-color: transparent;
    background-color: var(--color-bg-brand);
  }
  & > input:checked ~ svg {
    display: block;
  }
  & > input:disabled + span {
    border-color: var(--color-border-disabled);
    background-color: var(--color-bg-disabled);
  }
  & > input:focus-visible + span {
    outline-style: solid;
    outline-width: var(--border-width-focus);
    outline-offset: var(--border-width-focus);
    outline-color: var(--color-border-brand);
  }
`;

const face = css`
  position: absolute;
  inset: 0;
  border-radius: var(--radius-100);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--color-border-brand-tertiary);
  background-color: var(--color-bg-default);
`;

const faceOn = css`
  border-color: transparent;
  background-color: var(--color-bg-brand);
`;

const check = css`
  position: relative;
  z-index: 10;
  display: none;
  max-width: none;
  color: var(--color-fg-on-brand);
`;

const bar = css`
  position: relative;
  z-index: 10;
  height: 1.6px;
  width: var(--space-200);
  border-radius: var(--radius-full);
  background-color: var(--color-fg-on-brand);
`;

const note = css`
  display: flex;
  gap: var(--space-300);
`;

const spacer = css`
  width: var(--space-400);
  height: var(--space-400);
  flex-shrink: 0;
`;

export const Checkbox = ({
  label,
  description,
  indeterminate = false,
  className,
  id,
  disabled,
  ...props
}: CheckboxProps) => {
  const generated = useId();
  const inputId = id ?? generated;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <div className={cx(stack, className)}>
      <label htmlFor={inputId} className={row}>
        <span className={box}>
          <input
            {...props}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            aria-describedby={descriptionId}
            className={srOnly}
            ref={(node) => {
              if (node) node.indeterminate = indeterminate;
            }}
          />
          <span className={cx(face, indeterminate && faceOn)} />
          {indeterminate ? (
            <span className={bar} />
          ) : (
            <Icon name="check" aria-hidden className={check} />
          )}
        </span>
        <Typography as="span" variant="body" tone={disabled ? "disabled" : undefined}>
          {label}
        </Typography>
      </label>
      {description ? (
        <span id={descriptionId} className={note}>
          <span className={spacer} />
          <Typography variant="body" tone="secondary">
            {description}
          </Typography>
        </span>
      ) : null}
    </div>
  );
};

Checkbox.displayName = "Checkbox";
