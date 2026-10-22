import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TagToggle } from "./TagToggle";

const meta = {
  title: "Tag Toggle",
  component: TagToggle,
  args: { children: "Label", pressed: true },
  parameters: { a11y: { test: "error" } },
} satisfies Meta<typeof TagToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const On: Story = {};

export const Off: Story = { args: { pressed: false } };

export const Controlled: Story = {
  render: () => {
    const [pressed, setPressed] = useState(false);
    return (
      <TagToggle pressed={pressed} onPressedChange={setPressed}>
        Label
      </TagToggle>
    );
  },
};
