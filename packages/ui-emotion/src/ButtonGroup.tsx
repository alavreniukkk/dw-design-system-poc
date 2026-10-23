import { css, cx } from "@emotion/css";
import type { HTMLAttributes } from "react";

type Align = "start" | "end" | "center" | "justify" | "stack";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  align?: Align;
};

const base = css`
  display: flex;
  width: 100%;
  align-items: center;
  gap: var(--space-400);
`;

const aligns = {
  start: css`
    flex-direction: row;
    justify-content: flex-start;
  `,
  end: css`
    flex-direction: row;
    justify-content: flex-end;
  `,
  center: css`
    flex-direction: row;
    justify-content: center;
  `,
  justify: css`
    flex-direction: row;
    & > * {
      min-width: 1px;
      flex: 1;
    }
  `,
  stack: css`
    flex-direction: column;
    align-items: stretch;
    & > * {
      width: 100%;
    }
  `,
};

export const ButtonGroup = ({ align = "justify", className, children, ...props }: ButtonGroupProps) => (
  <div role="group" className={cx(base, aligns[align], className)} {...props}>
    {children}
  </div>
);

ButtonGroup.displayName = "ButtonGroup";
