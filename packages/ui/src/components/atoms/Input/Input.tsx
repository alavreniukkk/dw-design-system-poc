import { useId, type InputHTMLAttributes } from "react";
import { Field, controlClass } from "../Field/Field";
import { cn } from "../../../utils/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id?: string;
  label?: string;
  description?: string;
  error?: boolean;
};

export const Input = ({ id, label, description, error, className, disabled, ...props }: InputProps) => {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <Field id={inputId} label={label} description={description}>
      <input
        id={inputId}
        disabled={disabled}
        className={cn(controlClass, "h-(--size-icon-large)", className)}
        {...props}
        aria-invalid={error || undefined}
      />
    </Field>
  );
};

Input.displayName = "Input";
