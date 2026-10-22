import { useId, type TextareaHTMLAttributes } from "react";
import { Field, controlClass } from "../Field/Field";
import { cn } from "../../../utils/cn";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id?: string;
  label?: string;
  description?: string;
  error?: boolean;
};

export const Textarea = ({
  id,
  label,
  description,
  error,
  className,
  disabled,
  ...props
}: TextareaProps) => {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  return (
    <Field id={fieldId} label={label} description={description}>
      <textarea
        id={fieldId}
        disabled={disabled}
        className={cn(controlClass, "h-20 py-300 leading-[1.4]", className)}
        {...props}
        aria-invalid={error || undefined}
      />
    </Field>
  );
};

Textarea.displayName = "Textarea";
