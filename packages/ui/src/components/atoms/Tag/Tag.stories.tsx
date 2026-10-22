import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Tag",
  component: Tag,
  args: { children: "Tag", scheme: "brand", variant: "primary" },
  argTypes: {
    scheme: {
      control: "inline-radio",
      options: ["brand", "neutral", "positive", "danger", "warning"],
    },
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary"],
    },
    children: { control: "text" },
    className: { table: { disable: true } },
    onRemove: { table: { disable: true } },
  },
  parameters: {
    a11y: { test: "error" },
    controls: { include: ["children", "scheme", "variant"] },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  args: { onRemove: () => undefined },
};

export const Schemes: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {(["brand", "neutral", "positive", "danger", "warning"] as const).map((scheme) => (
        <Tag key={scheme} scheme={scheme}>
          {scheme}
        </Tag>
      ))}
    </div>
  ),
};
