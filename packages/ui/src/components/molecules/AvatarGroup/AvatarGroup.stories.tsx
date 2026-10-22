import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "../../atoms/Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup";

const meta = {
  title: "Avatar Group",
  component: AvatarGroup,
  args: { spacing: "spaced", overflow: 0 },
  argTypes: {
    spacing: {
      control: "inline-radio",
      options: ["spaced", "overlap"],
    },
    overflow: { control: "number" },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: { include: ["spacing", "overflow"] },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overlap: Story = {
  args: {
    spacing: "overlap",
    overflow: 1,
    children: (
      <>
        <Avatar type="initial" initials="A" />
        <Avatar type="initial" initials="B" />
        <Avatar type="initial" initials="C" />
      </>
    ),
  },
};

export const Spaced: Story = {
  args: {
    spacing: "spaced",
    children: (
      <>
        <Avatar type="initial" initials="A" />
        <Avatar type="initial" initials="B" />
      </>
    ),
  },
};
