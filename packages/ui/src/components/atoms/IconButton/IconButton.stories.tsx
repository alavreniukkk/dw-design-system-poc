import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "./IconButton";

const meta = {
  title: "Icon Button",
  component: IconButton,
  args: {
    children: "Star",
    icon: "star",
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
    icon: {
      control: "inline-radio",
      options: ["star", "plus"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
    className: { table: { disable: true } },
    type: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: {
      include: ["icon", "variant", "size", "disabled", "children"],
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Neutral: Story = {
  args: { variant: "neutral" },
};

export const Subtle: Story = {
  args: { variant: "subtle" },
};
