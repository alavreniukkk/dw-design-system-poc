import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Tag",
  component: Tag,
  args: { children: "Tag", scheme: "brand", variant: "primary" },
  parameters: { a11y: { test: "error" } },
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
