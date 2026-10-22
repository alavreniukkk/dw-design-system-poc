import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Typography } from "../Typography/Typography";
import { Icon } from "../../../icons";
import { cn } from "../../../utils/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
};

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
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={inputId} className="inline-flex items-center gap-300">
        <span className="relative inline-flex size-(--space-400) items-center justify-center">
          <input
            {...props}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            aria-describedby={descriptionId}
            className="peer sr-only"
            ref={(node) => {
              if (node) node.indeterminate = indeterminate;
            }}
          />
          <span
            className={cn(
              "absolute inset-0 rounded-100 border border-solid border-(--color-border-brand-tertiary) bg-(--color-bg-default) peer-checked:border-transparent peer-checked:bg-(--color-bg-brand) peer-focus-visible:outline-solid peer-focus-visible:outline-(length:--border-width-focus) peer-focus-visible:outline-offset-(--border-width-focus) peer-focus-visible:outline-(--color-border-brand) peer-disabled:border-(--color-border-disabled) peer-disabled:bg-(--color-bg-disabled)",
              indeterminate && "border-transparent bg-(--color-bg-brand)",
            )}
          />
          {indeterminate ? (
            <span className="relative z-10 h-[1.6px] w-200 rounded-full bg-(--color-fg-on-brand)" />
          ) : (
            <Icon
              name="check"
              aria-hidden
              className="relative z-10 hidden text-(--color-fg-on-brand) peer-checked:block"
            />
          )}
        </span>
        <Typography as="span" variant="body" tone={disabled ? "disabled" : undefined}>
          {label}
        </Typography>
      </label>
      {description ? (
        <span id={descriptionId} className="flex gap-300">
          <span className="size-(--space-400) shrink-0" />
          <Typography variant="body" tone="secondary">
            {description}
          </Typography>
        </span>
      ) : null}
    </div>
  );
};

Checkbox.displayName = "Checkbox";
