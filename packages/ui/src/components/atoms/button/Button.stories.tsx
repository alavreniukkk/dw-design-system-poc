import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Button",
  component: Button,
  args: {
    children: "Label",
    variant: "primary",
    size: "md",
    content: "text",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "tertiary"],
    },
    size: {
      control: "inline-radio",
      options: ["md", "sm"],
    },
    content: {
      control: "inline-radio",
      options: ["text", "icon-text", "icon"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
    className: { table: { disable: true } },
    type: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: {
      include: ["variant", "size", "content", "disabled", "children"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary" },
};

const brandLabel: CSSProperties = {
  margin: "0 0 8px",
  fontFamily: "var(--btn-font)",
  fontSize: "var(--btn-font-size-md)",
  color: "var(--btn-secondary-fg)",
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
