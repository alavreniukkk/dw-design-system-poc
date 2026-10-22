import { render, screen } from "@testing-library/react";
import { AvatarBlock } from "./AvatarBlock";

test("puts a large avatar beside the title and description", () => {
  render(<AvatarBlock title="Title" description="Description" src="/portrait.png" alt="Ada" />);
  const title = screen.getByText("Title");
  const description = screen.getByText("Description");
  expect(title.className).toContain("font-semibold");
  expect(title.className).toContain("text-(--color-fg-secondary)");
  expect(description.className).toContain("text-(--color-fg-tertiary)");
  expect(title.parentElement?.className).toContain("gap-050");
  const image = screen.getByRole("img", { name: "Ada" });
  expect(image.parentElement?.className).toContain("size-(--size-icon-large)");
  expect(image.parentElement?.parentElement?.className).toContain("gap-300");
  expect(image.parentElement?.parentElement?.className).toContain("w-(--size-avatar-block)");
});

test("exposes displayName", () => {
  expect(AvatarBlock.displayName).toBe("AvatarBlock");
});
