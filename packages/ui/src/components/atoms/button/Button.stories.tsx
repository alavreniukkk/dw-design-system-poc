import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Button",
  component: Button,
  args: {
    children: "Button",
    variant: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "neutral", "subtle"],
    },
    size: {
      control: "inline-radio",
      options: ["medium", "small"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
    className: { table: { disable: true } },
    type: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: {
      include: ["variant", "size", "disabled", "children"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Neutral: Story = {
  args: { variant: "neutral" },
};

export const Subtle: Story = {
  args: { variant: "subtle" },
};

const brandLabel: CSSProperties = {
  margin: "0 0 8px",
  fontFamily: "var(--button-font)",
  fontSize: "var(--button-font-size-medium)",
  color: "var(--button-neutral-fg)",
};

export const Acme: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
      <div>
        <p style={brandLabel}>Default</p>
        <Button {...args} />
      </div>
      <div data-brand="acme">
        <p style={brandLabel}>Acme</p>
        <Button {...args} />
      </div>
    </div>
  ),
};
