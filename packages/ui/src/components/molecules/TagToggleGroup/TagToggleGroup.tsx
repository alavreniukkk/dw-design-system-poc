import type { HTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

export type TagToggleGroupProps = HTMLAttributes<HTMLDivElement>;

export const TagToggleGroup = ({ className, children, ...props }: TagToggleGroupProps) => (
  <div role="group" className={cn("inline-flex items-center gap-200", className)} {...props}>
    {children}
  </div>
);

TagToggleGroup.displayName = "TagToggleGroup";
