import { render, screen } from "@testing-library/react";
import { Input } from "./Input";

test("connects the label and marks invalid", () => {
  render(<Input label="Label" description="Description" error placeholder="Value" />);
  const field = screen.getByLabelText("Label");
  expect(field.getAttribute("aria-invalid")).toBe("true");
  expect(screen.queryByText("Error")).toBeNull();
  expect(field.className).toContain("h-(--size-icon-large)");
});

test("exposes displayName", () => {
  expect(Input.displayName).toBe("Input");
});
