import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TagToggle } from "../../atoms/TagToggle/TagToggle";
import { TagToggleGroup } from "./TagToggleGroup";

const labels = ["Label", "Label", "Label", "Label", "Label", "Label", "Label"];

const meta = {
  title: "Tag Toggle Group",
  component: TagToggleGroup,
  parameters: {
    a11y: { test: "error" },
    controls: { include: [] },
  },
  argTypes: {
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof TagToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [pressed, setPressed] = useState<number[]>([0]);

    return (
      <TagToggleGroup>
        {labels.map((label, index) => (
          <TagToggle
            key={index}
            pressed={pressed.includes(index)}
            onPressedChange={(next) => {
              setPressed((current) =>
                next ? [...current, index] : current.filter((item) => item !== index),
              );
            }}
          >
            {label}
          </TagToggle>
        ))}
      </TagToggleGroup>
    );
  },
};
