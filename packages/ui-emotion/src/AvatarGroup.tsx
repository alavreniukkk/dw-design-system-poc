import { css, cx } from "@emotion/css";
import type { HTMLAttributes, ReactNode } from "react";
import { Typography } from "./Typography";

type Spacing = "spaced" | "overlap";

export type AvatarGroupProps = HTMLAttributes<HTMLDivElement> & {
  spacing?: Spacing;
  children: ReactNode;
  overflow?: number;
};

const outer = css`
  display: inline-flex;
  align-items: center;
`;

const spacedOuter = css`
  gap: var(--space-100);
`;

const overlapOuter = css`
  isolation: isolate;
  gap: var(--space-200);
`;

const row = css`
  display: flex;
  align-items: center;
`;

const spacedRow = css`
  gap: var(--space-100);
`;

const overlapRow = css`
  position: relative;
  z-index: 1;
  & > :not(:last-child) {
    margin-right: calc(var(--space-200) * -1);
  }
  & > * {
    box-shadow: var(--shadow-200);
  }
`;

export const AvatarGroup = ({ spacing = "spaced", overflow, className, children, ...props }: AvatarGroupProps) => (
  <div className={cx(outer, spacing === "overlap" ? overlapOuter : spacedOuter, className)} {...props}>
    <div className={cx(row, spacing === "overlap" ? overlapRow : spacedRow)}>{children}</div>
    {overflow ? (
      <Typography as="span" variant="body-small" tone="secondary">
        +{overflow}
      </Typography>
    ) : null}
  </div>
);

AvatarGroup.displayName = "AvatarGroup";
