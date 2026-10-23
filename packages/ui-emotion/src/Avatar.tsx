import { css, cx } from "@emotion/css";
import type { HTMLAttributes } from "react";
import { Typography } from "./Typography";

type Type = "initial" | "image";
type Size = "large" | "medium" | "small";
type Shape = "circle" | "square";

export type AvatarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  type?: Type;
  size?: Size;
  shape?: Shape;
  src?: string;
  alt?: string;
  initials?: string;
};

const base = css`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const initial = css`
  background-color: var(--color-bg-brand);
  color: var(--color-fg-on-brand);
`;

const sizes = {
  large: css`
    width: var(--size-icon-large);
    height: var(--size-icon-large);
  `,
  medium: css`
    width: var(--size-icon-medium);
    height: var(--size-icon-medium);
  `,
  small: css`
    width: var(--size-icon-small);
    height: var(--size-icon-small);
  `,
};

const circle = css`
  border-radius: var(--radius-full);
`;

const squareRadius = {
  large: css`
    border-radius: var(--radius-200);
  `,
  medium: css`
    border-radius: var(--radius-200);
  `,
  small: css`
    border-radius: var(--radius-100);
  `,
};

const image = css`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const initialVariant = {
  large: "subheading",
  medium: "body",
  small: "body-small",
} as const;

export const Avatar = ({
  type = "image",
  size = "large",
  shape = "circle",
  className,
  src,
  alt = "",
  initials,
  ...props
}: AvatarProps) => (
  <div
    className={cx(base, type === "initial" && initial, sizes[size], shape === "circle" ? circle : squareRadius[size], className)}
    {...props}
  >
    {type === "initial" ? (
      <Typography as="span" variant={initialVariant[size]}>
        {initials}
      </Typography>
    ) : src ? (
      <img alt={alt} src={src} className={image} />
    ) : null}
  </div>
);

Avatar.displayName = "Avatar";
