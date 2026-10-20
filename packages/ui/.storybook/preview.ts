import type { Preview } from "@storybook/react-vite";
import "../dist/styles.css";
import "../../../web/uk/acme/src/styles/brand.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
  },
};

export default preview;
