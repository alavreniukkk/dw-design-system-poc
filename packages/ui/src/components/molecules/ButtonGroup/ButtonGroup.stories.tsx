import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/Button/Button";
import { ButtonGroup } from "./ButtonGroup";

const meta = {
  title: "Button Group",
  component: ButtonGroup,
  args: {
    align: "justify",
  },
  argTypes: {
    align: {
      control: "inline-radio",
      options: ["start", "end", "center", "justify", "stack"],
    },
    className: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: {
      include: ["align"],
    },
  },
  render: (args) => (
    <div className="w-[240px]">
      <ButtonGroup {...args}>
        <Button variant="subtle">Button</Button>
        <Button>Button</Button>
      </ButtonGroup>
    </div>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Justify: Story = {};

export const Start: Story = {
  args: { align: "start" },
};

export const End: Story = {
  args: { align: "end" },
};

export const Center: Story = {
  args: { align: "center" },
};

export const Stack: Story = {
  args: { align: "stack" },
};
