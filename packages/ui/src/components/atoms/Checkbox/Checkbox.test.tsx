import { render, screen } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

test("toggles and describes the field", () => {
  render(<Checkbox label="Label" description="Description" />);
  const box = screen.getByRole("checkbox", { name: "Label" });
  expect(box.getAttribute("aria-describedby")).toBeTruthy();
  box.click();
  expect((box as HTMLInputElement).checked).toBe(true);
});

test("marks indeterminate", () => {
  render(<Checkbox label="Label" indeterminate />);
  expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
});

test("exposes displayName", () => {
  expect(Checkbox.displayName).toBe("Checkbox");
});
