import { css, cx } from "@emotion/css";
import type { HTMLAttributes, ReactNode } from "react";

type Variant =
  | "title-hero"
  | "title-page"
  | "subtitle"
  | "heading"
  | "subheading"
  | "body"
  | "body-strong"
  | "body-emphasis"
  | "body-link"
  | "body-small"
  | "body-small-strong"
  | "code"
  | "body-single"
  | "body-small-strong-single";

type Tone =
  | "default"
  | "secondary"
  | "tertiary"
  | "brand"
  | "brand-secondary"
  | "brand-tertiary"
  | "on-brand"
  | "positive"
  | "warning"
  | "danger"
  | "disabled"
  | "neutral";

const tags = ["p", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "a", "label", "strong", "em", "code", "li"] as const;

export type TypographyTag = (typeof tags)[number];

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: TypographyTag;
  variant?: Variant;
  tone?: Tone;
  children?: ReactNode;
  htmlFor?: string;
  href?: string;
};

const sans = css`
  font-family: var(--font-sans);
`;

const mono = css`
  font-family: var(--font-mono);
`;

const variants = {
  "title-hero": css`
    font-size: var(--font-size-10);
    line-height: 1.2;
    font-weight: var(--font-weight-bold);
    letter-spacing: -0.03em;
  `,
  "title-page": css`
    font-size: var(--font-size-08);
    line-height: 1.2;
    font-weight: var(--font-weight-bold);
    letter-spacing: -0.02em;
  `,
  subtitle: css`
    font-size: var(--font-size-06);
    line-height: 1.2;
    font-weight: var(--font-weight-regular);
  `,
  heading: css`
    font-size: var(--font-size-05);
    line-height: 1.2;
    font-weight: var(--font-weight-semibold);
    letter-spacing: -0.02em;
  `,
  subheading: css`
    font-size: var(--font-size-04);
    line-height: 1.2;
    font-weight: var(--font-weight-regular);
  `,
  body: css`
    font-size: var(--font-size-03);
    line-height: 1.4;
    font-weight: var(--font-weight-regular);
  `,
  "body-strong": css`
    font-size: var(--font-size-03);
    line-height: 1.4;
    font-weight: var(--font-weight-semibold);
  `,
  "body-emphasis": css`
    font-size: var(--font-size-03);
    line-height: 1.4;
    font-weight: var(--font-weight-regular);
    font-style: italic;
  `,
  "body-link": css`
    font-size: var(--font-size-03);
    line-height: 1.4;
    font-weight: var(--font-weight-regular);
    text-decoration-line: underline;
  `,
  "body-small": css`
    font-size: var(--font-size-02);
    line-height: 1.4;
    font-weight: var(--font-weight-regular);
  `,
  "body-small-strong": css`
    font-size: var(--font-size-02);
    line-height: 1.4;
    font-weight: var(--font-weight-semibold);
  `,
  code: css`
    font-size: var(--font-size-03);
    line-height: 1.3;
    font-weight: var(--font-weight-regular);
  `,
  "body-single": css`
    font-size: var(--font-size-03);
    line-height: 1;
    font-weight: var(--font-weight-regular);
  `,
  "body-small-strong-single": css`
    font-size: var(--font-size-02);
    line-height: 1;
    font-weight: var(--font-weight-semibold);
  `,
} satisfies Record<Variant, string>;

const tones = {
  default: css`
    color: var(--color-fg-default);
  `,
  secondary: css`
    color: var(--color-fg-secondary);
  `,
  tertiary: css`
    color: var(--color-fg-tertiary);
  `,
  brand: css`
    color: var(--color-fg-brand);
  `,
  "brand-secondary": css`
    color: var(--color-fg-brand-secondary);
  `,
  "brand-tertiary": css`
    color: var(--color-fg-brand-tertiary);
  `,
  "on-brand": css`
    color: var(--color-fg-on-brand);
  `,
  positive: css`
    color: var(--color-fg-positive);
  `,
  warning: css`
    color: var(--color-fg-warning);
  `,
  danger: css`
    color: var(--color-fg-danger);
  `,
  disabled: css`
    color: var(--color-fg-disabled);
  `,
  neutral: css`
    color: var(--color-fg-neutral);
  `,
} satisfies Record<Tone, string>;

export const Typography = ({
  as: Tag = "p",
  variant = "body",
  tone,
  className,
  ...props
}: TypographyProps) => (
  <Tag className={cx(variant === "code" ? mono : sans, variants[variant], tone && tones[tone], className)} {...props} />
);

Typography.displayName = "Typography";
