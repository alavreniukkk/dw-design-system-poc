import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const portrait = "/avatar-portrait.png";

const meta = {
  title: "Avatar",
  component: Avatar,
  args: {
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
    src: { control: "text" },
    alt: { control: "text" },
    initials: { control: "text" },
    className: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: {
      include: ["type", "size", "shape", "src", "alt", "initials"],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

const sizes = ["large", "medium", "small"] as const;
const shapes = ["circle", "square"] as const;

export const Image: Story = {};

export const Initial: Story = {
  args: { type: "initial" },
};

export const Square: Story = {
  args: { shape: "square" },
};

export const Circle: Story = {
  args: { shape: "circle" },
};

export const All: Story = {
  render: (args) => (
    <div className="flex gap-16">
      {(["image", "initial"] as const).map((type) => (
        <div key={type} className="flex flex-col items-center gap-4">
          {sizes.flatMap((size) =>
            shapes.map((shape) => (
              <Avatar key={`${type}-${size}-${shape}`} {...args} type={type} size={size} shape={shape} />
            )),
          )}
        </div>
      ))}
    </div>
  ),
};
