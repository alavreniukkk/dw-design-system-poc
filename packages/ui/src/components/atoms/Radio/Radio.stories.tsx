import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./Radio";

const meta = {
  title: "Radio",
  component: Radio,
  args: { label: "Label", description: "Description", name: "radio" },
  parameters: { a11y: { test: "error" } },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };
