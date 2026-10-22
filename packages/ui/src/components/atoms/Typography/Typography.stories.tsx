import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typography } from "./Typography";

const meta = {
  title: "Typography",
  component: Typography,
  args: { children: "The quick brown fox", variant: "body", tone: "default", as: "p" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "title-hero",
        "title-page",
        "subtitle",
        "heading",
        "subheading",
        "body",
        "body-strong",
        "body-emphasis",
        "body-link",
        "body-small",
        "body-small-strong",
        "code",
        "body-single",
        "body-small-strong-single",
      ],
    },
    tone: {
      control: "select",
      options: [
        "default",
        "secondary",
        "tertiary",
        "brand",
        "brand-secondary",
        "brand-tertiary",
        "on-brand",
        "positive",
        "warning",
        "danger",
        "disabled",
        "neutral",
      ],
    },
    as: {
      control: "select",
      options: ["p", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "a", "label", "strong", "em", "code", "li"],
    },
    children: { control: "text" },
    className: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: { include: ["children", "variant", "tone", "as"] },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants = [
  "title-hero",
  "title-page",
  "subtitle",
  "heading",
  "subheading",
  "body",
  "body-strong",
  "body-emphasis",
  "body-link",
  "body-small",
  "body-small-strong",
  "code",
  "body-single",
  "body-small-strong-single",
] as const;

export const Body: Story = {};

export const All: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      {variants.map((variant) => (
        <Typography key={variant} variant={variant}>
          {variant}
        </Typography>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {(["default", "secondary", "brand", "danger", "positive", "warning"] as const).map((tone) => (
        <Typography key={tone} tone={tone}>
          {tone}
        </Typography>
      ))}
    </div>
  ),
};
