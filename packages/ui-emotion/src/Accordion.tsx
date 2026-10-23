import { css, cx } from "@emotion/css";
import { useId, useState, type ReactNode } from "react";
import { Icon } from "@dw/ui/icons";
import { focusVisible } from "./css";
import { Typography } from "./Typography";

export type AccordionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

const frame = css`
  width: 100%;
  border-radius: var(--radius-200);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--color-border-default);
`;

const openFrame = css`
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  background-color: var(--color-bg-default);
  padding: var(--space-400);
`;

const closedFrame = css`
  background-color: var(--color-bg-default-secondary);
`;

const trigger = css`
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  gap: var(--space-200);
  text-align: left;
`;

const closedTrigger = css`
  padding: var(--space-400);
`;

const title = css`
  min-width: var(--space-0);
  flex: 1;
`;

export const Accordion = ({
  title: label,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
}: AccordionProps) => {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const panelId = useId();
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };

  return (
    <div className={cx(frame, isOpen ? openFrame : closedFrame, className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cx(trigger, !isOpen && closedTrigger, focusVisible)}
        onClick={() => setOpen(!isOpen)}
      >
        <Typography as="span" variant="body-strong" className={title}>
          {label}
        </Typography>
        <Icon name={isOpen ? "chevron-up" : "chevron-down"} aria-hidden width={20} height={20} />
      </button>
      {isOpen ? (
        <div id={panelId}>
          <Typography variant="body">{children}</Typography>
        </div>
      ) : null}
    </div>
  );
};

Accordion.displayName = "Accordion";
