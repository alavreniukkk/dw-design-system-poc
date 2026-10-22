import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion } from "./Accordion";

const meta = {
  title: "Accordion",
  component: Accordion,
  args: {
    title: "Title",
    children: "Answer the frequently asked question in a simple sentence, a longish paragraph, or even in a list.",
    defaultOpen: false,
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    defaultOpen: { control: "boolean" },
    className: { table: { disable: true } },
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: { test: "error" },
    controls: { include: ["title", "children", "defaultOpen"] },
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { defaultOpen: true } };
