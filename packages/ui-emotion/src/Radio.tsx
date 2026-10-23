import { css, cx } from "@emotion/css";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { srOnly } from "./css";
import { Typography } from "./Typography";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
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
    border-color: var(--color-border-brand);
    background-color: var(--color-bg-brand-secondary);
  }
  & > input:checked ~ span:last-child {
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
  border-radius: var(--radius-full);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--color-border-brand-tertiary);
  background-color: var(--color-bg-default);
`;

const dot = css`
  position: relative;
  z-index: 10;
  display: none;
  width: calc(var(--spacing) * 2.5);
  height: calc(var(--spacing) * 2.5);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-brand);
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

export const Radio = ({ label, description, className, id, disabled, ...props }: RadioProps) => {
  const generated = useId();
  const inputId = id ?? generated;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <div className={cx(stack, className)}>
      <label htmlFor={inputId} className={row}>
        <span className={box}>
          <input
            id={inputId}
            type="radio"
            disabled={disabled}
            aria-describedby={descriptionId}
            className={srOnly}
            {...props}
          />
          <span className={face} />
          <span className={dot} />
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

Radio.displayName = "Radio";
