import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarBlock } from "./AvatarBlock";

const portrait = "/avatar-portrait.png";

const meta = {
  title: "Avatar Block",
  component: AvatarBlock,
  args: {
    title: "Title",
    description: "Description",
    type: "image",
    size: "large",
    shape: "circle",
    src: portrait,
    alt: "",
    initials: "F",
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["image", "initial"],
    },
    size: {
      control: "inline-radio",
      options: ["large", "medium", "small"],
    },
    shape: {
      control: "inline-radio",
      options: ["circle", "square"],
    },
    title: { control: "text" },
    description: { control: "text" },
    src: { control: "text" },
    alt: { control: "text" },
    initials: { control: "text" },
    className: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: {
      include: ["title", "description", "type", "size", "shape", "src", "alt", "initials"],
    },
  },
} satisfies Meta<typeof AvatarBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Image: Story = {};

export const Initial: Story = {
  args: { type: "initial", initials: "F" },
};
