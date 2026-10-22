import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import migrated from "../../../../migrated.json";

const meta = {
  title: "Migrated",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const page: CSSProperties = {
  minHeight: "100vh",
  margin: 0,
  padding: 32,
  boxSizing: "border-box",
  background: "var(--color-bg-default-secondary)",
  color: "var(--color-fg-default)",
  fontFamily: "var(--font-sans)",
};

const heading: CSSProperties = {
  margin: "0 0 16px",
  fontSize: 20,
  fontWeight: 600,
};

const list: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: 8,
  maxWidth: 320,
};

const item: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: 0,
  padding: "10px 12px",
  background: "var(--color-bg-neutral-tertiary)",
  border: "1px solid var(--color-border-neutral-secondary)",
  borderRadius: "var(--radius-200)",
  fontSize: "var(--font-size-03)",
};

const mark: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 99,
  background: "var(--color-bg-brand)",
  flex: "0 0 auto",
};

export const List: Story = {
  render: () => {
    const components = migrated.components;

    return (
      <div style={page}>
        <h1 style={heading}>Migrated</h1>
        {components.length === 0 ? (
          <p style={{ margin: 0, fontSize: "var(--font-size-03)" }}>No components yet.</p>
        ) : (
          <ul style={list}>
            {components.map((name) => (
              <li key={name} style={item}>
                <span aria-hidden="true" style={mark} />
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
};
