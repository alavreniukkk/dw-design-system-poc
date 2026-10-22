import { render, screen } from "@testing-library/react";
import { Typography } from "./Typography";

test("separates the element from the visual variant", () => {
  render(
    <Typography as="h1" variant="title-hero" tone="brand">
      Title
    </Typography>,
  );
  const title = screen.getByRole("heading", { level: 1, name: "Title" });
  expect(title.className).toContain("text-10");
  expect(title.className).toContain("font-bold");
  expect(title.className).toContain("text-(--color-fg-brand)");
});

test("body link stays a paragraph until the caller picks an anchor", () => {
  render(<Typography variant="body-link">Read</Typography>);
  expect(screen.getByText("Read").tagName).toBe("P");
  expect(screen.getByText("Read").className).toContain("underline");
});

test("exposes displayName", () => {
  expect(Typography.displayName).toBe("Typography");
});
