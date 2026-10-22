import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

const buttonGroupVariants = cva("flex w-full items-center gap-400", {
  variants: {
    align: {
      start: "flex-row justify-start",
      end: "flex-row justify-end",
      center: "flex-row justify-center",
      justify: "flex-row [&>*]:min-w-px [&>*]:flex-1",
      stack: "flex-col items-stretch [&>*]:w-full",
    },
  },
  defaultVariants: {
    align: "justify",
  },
});

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof buttonGroupVariants>;

export const ButtonGroup = ({ align, className, children, ...props }: ButtonGroupProps) => (
  <div role="group" className={cn(buttonGroupVariants({ align }), className)} {...props}>
    {children}
  </div>
);

ButtonGroup.displayName = "ButtonGroup";
