import { render, screen } from "@testing-library/react";
import { TagToggle } from "./TagToggle";

test("reports the next pressed state", () => {
  const onPressedChange = jest.fn();
  render(<TagToggle onPressedChange={onPressedChange}>Label</TagToggle>);
  const button = screen.getByRole("button", { name: "Label" });
  expect(button.getAttribute("aria-pressed")).toBe("false");
  button.click();
  expect(onPressedChange).toHaveBeenCalledWith(true);
});

test("shows the check while pressed", () => {
  render(<TagToggle pressed>Label</TagToggle>);
  expect(screen.getByRole("button", { name: "Label" }).querySelector("svg")).toBeTruthy();
});

test("exposes displayName", () => {
  expect(TagToggle.displayName).toBe("TagToggle");
});
