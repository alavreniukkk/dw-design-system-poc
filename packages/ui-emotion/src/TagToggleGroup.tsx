import { css, cx } from "@emotion/css";
import type { HTMLAttributes } from "react";

export type TagToggleGroupProps = HTMLAttributes<HTMLDivElement>;

const group = css`
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
`;

export const TagToggleGroup = ({ className, children, ...props }: TagToggleGroupProps) => (
  <div role="group" className={cx(group, className)} {...props}>
    {children}
  </div>
);

TagToggleGroup.displayName = "TagToggleGroup";
