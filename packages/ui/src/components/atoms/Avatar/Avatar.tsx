import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { Typography } from "../Typography/Typography";
import { cn } from "../../../utils/cn";

const avatarVariants = cva("relative inline-flex shrink-0 items-center justify-center overflow-hidden", {
  variants: {
    type: {
      initial: "bg-(--color-bg-brand) text-(--color-fg-on-brand)",
      image: "",
    },
    size: {
      large: "size-(--size-icon-large)",
      medium: "size-(--size-icon-medium)",
      small: "size-(--size-icon-small)",
    },
    shape: {
      circle: "rounded-full",
      square: "",
    },
  },
  compoundVariants: [
    { shape: "square", size: "large", class: "rounded-200" },
    { shape: "square", size: "medium", class: "rounded-200" },
    { shape: "square", size: "small", class: "rounded-100" },
  ],
  defaultVariants: {
    type: "image",
    size: "large",
    shape: "circle",
  },
});

const initialVariant = {
  large: "subheading",
  medium: "body",
  small: "body-small",
} as const;

export type AvatarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  VariantProps<typeof avatarVariants> & {
    src?: string;
    alt?: string;
    initials?: string;
  };

export const Avatar = ({
  type,
  size,
  shape,
  className,
  src,
  alt = "",
  initials,
  ...props
}: AvatarProps) => {
  const resolvedSize = size ?? "large";
  return (
    <div className={cn(avatarVariants({ type, size, shape }), className)} {...props}>
      {type === "initial" ? (
        <Typography as="span" variant={initialVariant[resolvedSize]}>
          {initials}
        </Typography>
      ) : src ? (
        <img alt={alt} src={src} className="absolute inset-0 size-full object-cover" />
      ) : null}
    </div>
  );
};

Avatar.displayName = "Avatar";
