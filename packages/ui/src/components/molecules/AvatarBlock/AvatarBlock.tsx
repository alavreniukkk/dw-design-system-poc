import type { HTMLAttributes } from "react";
import { Avatar, type AvatarProps } from "../../atoms/Avatar/Avatar";
import { Typography } from "../../atoms/Typography/Typography";
import { cn } from "../../../utils/cn";

export type AvatarBlockProps = HTMLAttributes<HTMLDivElement> &
  Pick<AvatarProps, "type" | "src" | "alt" | "initials" | "shape" | "size"> & {
    title: string;
    description?: string;
  };

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
  <div className={cn("inline-flex w-(--size-avatar-block) items-start gap-300", className)} {...props}>
    <Avatar type={type} src={src} alt={alt} initials={initials} shape={shape} size={size} />
    <div className="flex min-w-0 flex-col gap-050">
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
