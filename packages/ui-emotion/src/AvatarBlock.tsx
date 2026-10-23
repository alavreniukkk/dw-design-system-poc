import { css, cx } from "@emotion/css";
import type { HTMLAttributes } from "react";
import { Avatar, type AvatarProps } from "./Avatar";
import { Typography } from "./Typography";

export type AvatarBlockProps = HTMLAttributes<HTMLDivElement> &
  Pick<AvatarProps, "type" | "src" | "alt" | "initials" | "shape" | "size"> & {
    title: string;
    description?: string;
  };

const row = css`
  display: inline-flex;
  width: var(--size-avatar-block);
  align-items: flex-start;
  gap: var(--space-300);
`;

const copy = css`
  display: flex;
  min-width: var(--space-0);
  flex-direction: column;
  gap: var(--space-050);
`;

export const AvatarBlock = ({
  title,
  description,
  type = "image",
  src,
  alt = "",
  initials,
  shape = "circle",
  size = "large",
  className,
  ...props
}: AvatarBlockProps) => (
  <div className={cx(row, className)} {...props}>
    <Avatar type={type} src={src} alt={alt} initials={initials} shape={shape} size={size} />
    <div className={copy}>
      <Typography as="span" variant="body-strong" tone="secondary">
        {title}
      </Typography>
      {description ? (
        <Typography as="span" variant="body" tone="tertiary">
          {description}
        </Typography>
      ) : null}
    </div>
  </div>
);

AvatarBlock.displayName = "AvatarBlock";
