import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonDanger } from "./ButtonDanger";

const meta = {
  title: "Button Danger",
  component: ButtonDanger,
  args: {
    children: "Button",
    variant: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "subtle"],
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
} satisfies Meta<typeof ButtonDanger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Subtle: Story = {
  args: { variant: "subtle" },
};
