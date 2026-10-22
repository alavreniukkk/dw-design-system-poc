import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { Typography } from "../../atoms/Typography/Typography";
import { cn } from "../../../utils/cn";

const groupVariants = cva("flex items-center", {
  variants: {
    spacing: {
      spaced: "gap-100",
      overlap: "[&>*:not(:last-child)]:-mr-200 [&>*]:shadow-200",
    },
  },
  defaultVariants: {
    spacing: "spaced",
  },
});

export type AvatarGroupProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof groupVariants> & {
    children: ReactNode;
    overflow?: number;
  };

export const AvatarGroup = ({ spacing, overflow, className, children, ...props }: AvatarGroupProps) => {
  const resolved = spacing ?? "spaced";
  return (
    <div
      className={cn("inline-flex items-center", resolved === "overlap" ? "isolate gap-200" : "gap-100", className)}
      {...props}
    >
      <div className={cn(groupVariants({ spacing: resolved }), resolved === "overlap" && "relative z-[1]")}>
        {children}
      </div>
      {overflow ? (
        <Typography as="span" variant="body-small" tone="secondary">
          +{overflow}
        </Typography>
      ) : null}
    </div>
  );
};

AvatarGroup.displayName = "AvatarGroup";
