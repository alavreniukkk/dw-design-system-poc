import { useId, useState, type ReactNode } from "react";
import { Typography } from "../../atoms/Typography/Typography";
import { Icon } from "../../../icons";
import { focusRing } from "../../../styles/focus";
import { cn } from "../../../utils/cn";

export type AccordionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export const Accordion = ({
  title,
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
    <div
      className={cn(
        "w-full rounded-200 border border-solid border-(--color-border-default)",
        isOpen
          ? "flex flex-col gap-200 bg-(--color-bg-default) p-400"
          : "bg-(--color-bg-default-secondary)",
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "flex w-full cursor-pointer items-center gap-200 text-left",
          !isOpen && "p-400",
          focusRing,
        )}
        onClick={() => setOpen(!isOpen)}
      >
        <Typography as="span" variant="body-strong" className="min-w-0 flex-1">
          {title}
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
