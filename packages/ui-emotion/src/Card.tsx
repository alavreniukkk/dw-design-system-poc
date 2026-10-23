import { css, cx } from "@emotion/css";
import type { HTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@dw/ui/icons";
import { iconFit } from "./css";
import { Typography } from "./Typography";

type Variant = "default" | "stroke";
type Direction = "vertical" | "horizontal";

export type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: Variant;
  direction?: Direction;
  title: string;
  body?: string;
  icon?: IconName | null;
  imageSrc?: string;
  imageAlt?: string;
  action?: ReactNode;
};

const base = css`
  display: flex;
  align-items: flex-start;
  gap: var(--space-600);
  border-radius: var(--radius-200);
  padding: var(--space-600);
`;

const stroke = css`
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--color-border-default);
  background-color: var(--color-bg-default);
`;

const directions = {
  vertical: css`
    flex-direction: column;
  `,
  horizontal: css`
    flex-direction: row;
  `,
};

const picture = css`
  width: var(--space-4000);
  height: var(--space-4000);
  flex-shrink: 0;
  object-fit: cover;
`;

const body = css`
  display: flex;
  min-width: var(--space-0);
  flex: 1;
  flex-direction: column;
  gap: var(--space-400);
`;

const copy = css`
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
`;

export const Card = ({
  variant = "stroke",
  direction = "vertical",
  title,
  body: text,
  icon = "info",
  imageSrc,
  imageAlt = "",
  action,
  className,
  ...props
}: CardProps) => (
  <article className={cx(base, variant === "stroke" && stroke, directions[direction], className)} {...props}>
    {imageSrc ? (
      <img src={imageSrc} alt={imageAlt} className={picture} />
    ) : icon ? (
      <Icon name={icon} aria-hidden width={32} height={32} className={iconFit} />
    ) : null}
    <div className={body}>
      <div className={copy}>
        <Typography as="h3" variant="heading">
          {title}
        </Typography>
        {text ? (
          <Typography variant="body" tone="secondary">
            {text}
          </Typography>
        ) : null}
      </div>
      {action}
    </div>
  </article>
);

Card.displayName = "Card";
