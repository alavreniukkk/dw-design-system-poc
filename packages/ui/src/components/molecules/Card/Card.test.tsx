import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

test("renders the stroke card", () => {
  render(<Card title="Title" body="Body text." icon={null} />);
  expect(screen.getByRole("heading", { name: "Title" })).toBeTruthy();
  expect(screen.getByRole("article").className).toContain("border-(--color-border-default)");
});

test("renders an image asset", () => {
  render(<Card title="Title" imageSrc="/portrait.png" imageAlt="Cover" icon={null} />);
  const image = screen.getByRole("img", { name: "Cover" });
  expect(image.getAttribute("src")).toBe("/portrait.png");
  expect(image.className).toContain("size-4000");
});

test("exposes displayName", () => {
  expect(Card.displayName).toBe("Card");
});
