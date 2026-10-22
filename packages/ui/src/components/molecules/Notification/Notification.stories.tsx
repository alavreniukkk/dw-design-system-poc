import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Notification } from "./Notification";

const Live = (props: ComponentProps<typeof Notification>) => {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return <Notification {...props} onDismiss={() => setOpen(false)} />;
};

const meta = {
  title: "Notification",
  component: Notification,
  args: {
    variant: "message",
    title: "Title",
    body: "Body text.",
    action: "Button",
    icon: "info",
    dismissible: true,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["message", "alert"],
    },
    title: { control: "text" },
    body: { control: "text" },
    action: { control: "text" },
    icon: {
      control: "inline-radio",
      options: ["info", "x", "x-small"],
    },
    dismissible: { control: "boolean" },
    className: { table: { disable: true } },
    onAction: { table: { disable: true } },
    onDismiss: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: {
      include: ["variant", "title", "body", "action", "icon", "dismissible"],
    },
  },
} satisfies Meta<typeof Notification>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Message: Story = {
  render: (args) => <Live {...args} />,
};

export const Alert: Story = {
  args: { variant: "alert" },
  render: (args) => <Live {...args} />,
};

export const All: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Live {...args} variant="message" />
      <Live {...args} variant="alert" />
    </div>
  ),
};
