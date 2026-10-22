import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Textarea",
  component: Textarea,
  args: { label: "Label", placeholder: "Value" },
  parameters: { a11y: { test: "error" } },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = { args: { error: true, defaultValue: "Value" } };
