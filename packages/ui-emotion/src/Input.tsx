import { cx } from "@emotion/css";
import { useId, type InputHTMLAttributes } from "react";
import { controlClass, controlHeight, Field } from "./Field";

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
        className={cx(controlClass, controlHeight, className)}
        {...props}
        aria-invalid={error || undefined}
      />
    </Field>
  );
};

Input.displayName = "Input";
