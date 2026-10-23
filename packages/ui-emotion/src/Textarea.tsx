import { cx } from "@emotion/css";
import { useId, type TextareaHTMLAttributes } from "react";
import { controlClass, Field, textareaClass } from "./Field";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id?: string;
  label?: string;
  description?: string;
  error?: boolean;
};

export const Textarea = ({ id, label, description, error, className, disabled, ...props }: TextareaProps) => {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  return (
    <Field id={fieldId} label={label} description={description}>
      <textarea
        id={fieldId}
        disabled={disabled}
        className={cx(controlClass, textareaClass, className)}
        {...props}
        aria-invalid={error || undefined}
      />
    </Field>
  );
};

Textarea.displayName = "Textarea";
