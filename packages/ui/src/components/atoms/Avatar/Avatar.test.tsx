import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

test("image fills the frame", () => {
  render(<Avatar src="/portrait.png" alt="Ada" />);
  const image = screen.getByRole("img", { name: "Ada" });
  expect(image.getAttribute("src")).toBe("/portrait.png");
  expect(image.className).toContain("object-cover");
  const frame = image.parentElement;
  expect(frame?.className).toContain("size-(--size-icon-large)");
  expect(frame?.className).toContain("rounded-full");
});

test("initial uses the letter and those classes", () => {
  render(<Avatar type="initial" initials="F" size="small" shape="square" />);
  const letter = screen.getByText("F");
  const frame = letter.parentElement;
  expect(frame?.className).toContain("bg-(--color-bg-brand)");
  expect(frame?.className).toContain("text-(--color-fg-on-brand)");
  expect(frame?.className).toContain("size-(--size-icon-small)");
  expect(letter.className).toContain("text-02");
  expect(frame?.className).toContain("rounded-100");
  expect(frame?.querySelector("img")).toBeNull();
});

test("medium square uses that radius", () => {
  render(<Avatar type="initial" initials="F" size="medium" shape="square" />);
  expect(screen.getByText("F").parentElement?.className).toContain("rounded-200");
});

test("exposes displayName", () => {
  expect(Avatar.displayName).toBe("Avatar");
});
