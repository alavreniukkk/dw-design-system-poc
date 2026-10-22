import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Typography } from "../Typography/Typography";
import { cn } from "../../../utils/cn";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
};

export const Radio = ({ label, description, className, id, disabled, ...props }: RadioProps) => {
  const generated = useId();
  const inputId = id ?? generated;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={inputId} className="inline-flex items-center gap-300">
        <span className="relative inline-flex size-400 items-center justify-center">
          <input
            id={inputId}
            type="radio"
            disabled={disabled}
            aria-describedby={descriptionId}
            className="peer sr-only"
            {...props}
          />
          <span className="absolute inset-0 rounded-full border border-solid border-(--color-border-brand-tertiary) bg-(--color-bg-default) peer-checked:border-(--color-border-brand) peer-checked:bg-(--color-bg-brand-secondary) peer-focus-visible:outline-solid peer-focus-visible:outline-(length:--border-width-focus) peer-focus-visible:outline-offset-(--border-width-focus) peer-focus-visible:outline-(--color-border-brand) peer-disabled:border-(--color-border-disabled) peer-disabled:bg-(--color-bg-disabled)" />
          <span className="relative z-10 hidden size-2.5 rounded-full bg-(--color-bg-brand) peer-checked:block" />
        </span>
        <Typography as="span" variant="body" tone={disabled ? "disabled" : undefined}>
          {label}
        </Typography>
      </label>
      {description ? (
        <span id={descriptionId} className="flex gap-300">
          <span className="size-400 shrink-0" />
          <Typography variant="body" tone="secondary">
            {description}
          </Typography>
        </span>
      ) : null}
    </div>
  );
};

Radio.displayName = "Radio";
