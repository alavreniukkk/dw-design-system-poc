import type { ReactNode } from "react";
import { Typography } from "../Typography/Typography";

export const fieldClass = "flex w-full min-w-0 flex-col items-start gap-200";

export const controlClass =
  "w-full rounded-200 border border-solid border-(--color-border-default) bg-(--color-bg-default) px-400 font-sans text-03 leading-none text-(--color-fg-default) outline-none placeholder:text-(--color-fg-tertiary) focus-visible:border-(--color-border-brand) disabled:cursor-not-allowed disabled:border-(--color-border-disabled) disabled:bg-(--color-bg-disabled) disabled:text-(--color-fg-disabled) aria-[invalid=true]:border-(--color-border-danger)";

type FieldProps = {
  id: string;
  label?: string;
  description?: string;
  children: ReactNode;
};

export const Field = ({ id, label, description, children }: FieldProps) => (
  <div className={fieldClass}>
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
