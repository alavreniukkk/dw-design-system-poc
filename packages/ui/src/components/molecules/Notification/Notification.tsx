import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { Button } from "../../atoms/Button/Button";
import { ButtonDanger } from "../../atoms/ButtonDanger/ButtonDanger";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { Typography } from "../../atoms/Typography/Typography";
import { Icon, type IconName } from "../../../icons";
import { focusRing } from "../../../../lib/focus";
import { cn } from "../../../utils/cn";

const notificationVariants = cva(
  "flex w-(--size-notification) items-start gap-300 rounded-200 border border-solid p-400",
  {
    variants: {
      variant: {
        message: "border-(--color-border-default-secondary) bg-(--color-bg-default) text-(--color-fg-default)",
        alert:
          "border-(--color-border-danger-tertiary) bg-(--color-bg-danger-tertiary) text-(--color-fg-danger)",
      },
    },
    defaultVariants: {
      variant: "message",
    },
  },
);

export type NotificationProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> &
  VariantProps<typeof notificationVariants> & {
    title: string;
    body?: string;
    icon?: IconName | null;
    action?: string;
    onAction?: () => void;
    dismissible?: boolean;
    onDismiss?: () => void;
  };

export const Notification = ({
  variant,
  title,
  body,
  icon = "info",
  action,
  onAction,
  dismissible = true,
  onDismiss,
  className,
  role,
  ...props
}: NotificationProps) => {
  const resolved = variant ?? "message";
  const Action = resolved === "alert" ? ButtonDanger : Button;

  return (
    <div
      role={role ?? (resolved === "alert" ? "alert" : "status")}
      className={cn(notificationVariants({ variant: resolved }), className)}
      {...props}
    >
      {icon ? <Icon name={icon} aria-hidden className="shrink-0" /> : null}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-400">
        <div className="flex w-full flex-col gap-100 wrap-break-words">
          <Typography as="p" variant="body-strong">
            {title}
          </Typography>
          {body ? <Typography as="p" variant="body">{body}</Typography> : null}
        </div>
        {action ? (
          <Action size="small" onClick={onAction}>
            {action}
          </Action>
        ) : null}
      </div>
      {dismissible && resolved === "message" ? (
        <IconButton icon="x" variant="subtle" size="small" onClick={onDismiss}>
          Dismiss
        </IconButton>
      ) : null}
      {dismissible && resolved === "alert" ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className={cn(
            "inline-flex size-(--size-icon-large) shrink-0 items-center justify-center rounded-full text-(--color-fg-danger)",
            focusRing,
          )}
        >
          <Icon name="x-small" aria-hidden />
        </button>
      ) : null}
    </div>
  );
};

Notification.displayName = "Notification";
