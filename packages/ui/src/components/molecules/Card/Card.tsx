import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { Typography } from "../../atoms/Typography/Typography";
import { Icon, type IconName } from "../../../icons";
import { cn } from "../../../utils/cn";

const cardVariants = cva("flex items-start gap-600 rounded-200 p-600", {
  variants: {
    variant: {
      default: "",
      stroke: "border border-solid border-(--color-border-default) bg-(--color-bg-default)",
    },
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  defaultVariants: {
    variant: "stroke",
    direction: "vertical",
  },
});

export type CardProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof cardVariants> & {
    title: string;
    body?: string;
    icon?: IconName | null;
    imageSrc?: string;
    imageAlt?: string;
    action?: ReactNode;
  };

export const Card = ({
  variant,
  direction,
  title,
  body,
  icon = "info",
  imageSrc,
  imageAlt = "",
  action,
  className,
  ...props
}: CardProps) => (
  <article className={cn(cardVariants({ variant, direction }), className)} {...props}>
    {imageSrc ? (
      <img src={imageSrc} alt={imageAlt} className="size-4000 shrink-0 object-cover" />
    ) : icon ? (
      <Icon name={icon} aria-hidden width={32} height={32} className="shrink-0" />
    ) : null}
    <div className="flex min-w-0 flex-1 flex-col gap-400">
      <div className="flex flex-col gap-200">
        <Typography as="h3" variant="heading">
          {title}
        </Typography>
        {body ? (
          <Typography variant="body" tone="secondary">
            {body}
          </Typography>
        ) : null}
      </div>
      {action}
    </div>
  </article>
);

Card.displayName = "Card";
