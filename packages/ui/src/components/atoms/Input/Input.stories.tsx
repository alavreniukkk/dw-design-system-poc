import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Input",
  component: Input,
  args: { label: "Label", placeholder: "Value" },
  parameters: { a11y: { test: "error" } },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: { error: true, defaultValue: "Value" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Value" },
};
