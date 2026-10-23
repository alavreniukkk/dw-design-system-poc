import { css, cx } from "@emotion/css";
import type { HTMLAttributes } from "react";
import { Icon, type IconName } from "@dw/ui/icons";
import { Button } from "./Button";
import { ButtonDanger } from "./ButtonDanger";
import { focusVisible, iconFit } from "./css";
import { IconButton } from "./IconButton";
import { Typography } from "./Typography";

type Variant = "message" | "alert";

export type NotificationProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & {
  variant?: Variant;
  title: string;
  body?: string;
  icon?: IconName | null;
  action?: string;
  onAction?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
};

const frame = css`
  display: flex;
  width: var(--size-notification);
  align-items: flex-start;
  gap: var(--space-300);
  border-radius: var(--radius-200);
  border-width: var(--border-width-default);
  border-style: solid;
  padding: var(--space-400);
`;

const variants = {
  message: css`
    border-color: var(--color-border-default-secondary);
    background-color: var(--color-bg-default);
    color: var(--color-fg-default);
  `,
  alert: css`
    border-color: var(--color-border-danger-tertiary);
    background-color: var(--color-bg-danger-tertiary);
    color: var(--color-fg-danger);
  `,
};

const content = css`
  display: flex;
  min-width: var(--space-0);
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-400);
`;

const copy = css`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--space-100);
  overflow-wrap: break-word;
`;

const dismiss = css`
  display: inline-flex;
  width: var(--size-icon-large);
  height: var(--size-icon-large);
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--color-fg-danger);
`;

export const Notification = ({
  variant = "message",
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
  const Action = variant === "alert" ? ButtonDanger : Button;

  return (
    <div
      role={role ?? (variant === "alert" ? "alert" : "status")}
      className={cx(frame, variants[variant], className)}
      {...props}
    >
      {icon ? <Icon name={icon} aria-hidden className={iconFit} /> : null}
      <div className={content}>
        <div className={copy}>
          <Typography as="p" variant="body-strong">
            {title}
          </Typography>
          {body ? (
            <Typography as="p" variant="body">
              {body}
            </Typography>
          ) : null}
        </div>
        {action ? (
          <Action size="small" onClick={onAction}>
            {action}
          </Action>
        ) : null}
      </div>
      {dismissible && variant === "message" ? (
        <IconButton icon="x" variant="subtle" size="small" onClick={onDismiss}>
          Dismiss
        </IconButton>
      ) : null}
      {dismissible && variant === "alert" ? (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className={cx(dismiss, focusVisible)}>
          <Icon name="x-small" aria-hidden />
        </button>
      ) : null}
    </div>
  );
};

Notification.displayName = "Notification";
