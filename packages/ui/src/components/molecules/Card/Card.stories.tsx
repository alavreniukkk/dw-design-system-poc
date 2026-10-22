import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Button } from "../../atoms/Button/Button";
import { Card } from "./Card";

const portrait = "/avatar-portrait.png";

type CardStoryArgs = ComponentProps<typeof Card> & {
  asset: "icon" | "image";
};

const meta = {
  title: "Card",
  component: Card,
  args: {
    title: "Title",
    body: "Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.",
    variant: "stroke",
    direction: "vertical",
    icon: "info",
    asset: "icon",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["stroke", "default"],
    },
    direction: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    asset: {
      control: "inline-radio",
      options: ["icon", "image"],
    },
    icon: {
      control: "select",
      options: ["info", "check", "chevron-down", "chevron-up", "plus", "search", "star", "x", "x-small"],
      if: { arg: "asset", eq: "icon" },
    },
    title: { control: "text" },
    body: { control: "text" },
    className: { table: { disable: true } },
    action: { table: { disable: true } },
    imageSrc: { table: { disable: true } },
    imageAlt: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 440 }}>
        <Story />
      </div>
    ),
  ],
  render: ({ asset, ...args }) => (
    <Card
      {...args}
      imageSrc={asset === "image" ? portrait : undefined}
      imageAlt={asset === "image" ? "Cover" : ""}
    />
  ),
  parameters: {
    a11y: { test: "error" },
    controls: { include: ["variant", "direction", "asset", "icon", "title", "body"] },
  },
} satisfies Meta<CardStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const button = <Button variant="neutral">Button</Button>;

export const Stroke: Story = {
  args: { action: button },
};

export const Default: Story = {
  args: { variant: "default", direction: "horizontal", action: button },
};

export const Image: Story = {
  args: { asset: "image", action: button },
};
