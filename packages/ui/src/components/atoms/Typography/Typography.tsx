import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils/cn";

const typographyVariants = cva("font-sans", {
  variants: {
    variant: {
      "title-hero": "text-10 leading-[1.2] font-bold tracking-[-0.03em]",
      "title-page": "text-08 leading-[1.2] font-bold tracking-[-0.02em]",
      subtitle: "text-06 leading-[1.2] font-normal",
      heading: "text-05 leading-[1.2] font-semibold tracking-[-0.02em]",
      subheading: "text-04 leading-[1.2] font-normal",
      body: "text-03 leading-[1.4] font-normal",
      "body-strong": "text-03 leading-[1.4] font-semibold",
      "body-emphasis": "text-03 leading-[1.4] font-normal italic",
      "body-link": "text-03 leading-[1.4] font-normal underline",
      "body-small": "text-02 leading-[1.4] font-normal",
      "body-small-strong": "text-02 leading-[1.4] font-semibold",
      code: "font-mono text-03 leading-[1.3] font-normal",
      "body-single": "text-03 leading-none font-normal",
      "body-small-strong-single": "text-02 leading-none font-semibold",
    },
    tone: {
      default: "text-(--color-fg-default)",
      secondary: "text-(--color-fg-secondary)",
      tertiary: "text-(--color-fg-tertiary)",
      brand: "text-(--color-fg-brand)",
      "brand-secondary": "text-(--color-fg-brand-secondary)",
      "brand-tertiary": "text-(--color-fg-brand-tertiary)",
      "on-brand": "text-(--color-fg-on-brand)",
      positive: "text-(--color-fg-positive)",
      warning: "text-(--color-fg-warning)",
      danger: "text-(--color-fg-danger)",
      disabled: "text-(--color-fg-disabled)",
      neutral: "text-(--color-fg-neutral)",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

const tags = ["p", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "a", "label", "strong", "em", "code", "li"] as const;

export type TypographyTag = (typeof tags)[number];

export type TypographyProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    as?: TypographyTag;
    children?: ReactNode;
    htmlFor?: string;
    href?: string;
  };

export const Typography = ({
  as = "p",
  variant,
  tone,
  className,
  ...props
}: TypographyProps) => {
  const Tag = as;
  return <Tag className={cn(typographyVariants({ variant, tone }), className)} {...props} />;
};

Typography.displayName = "Typography";
