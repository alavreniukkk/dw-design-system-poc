import { render, screen } from "@testing-library/react";
import { Textarea } from "./Textarea";

test("uses a taller control", () => {
  render(<Textarea label="Label" placeholder="Value" />);
  expect(screen.getByLabelText("Label").className).toContain("h-20");
});

test("marks invalid without a caption", () => {
  render(<Textarea label="Label" error defaultValue="Value" />);
  expect(screen.getByLabelText("Label").getAttribute("aria-invalid")).toBe("true");
  expect(screen.queryByText("Hint")).toBeNull();
});

test("exposes displayName", () => {
  expect(Textarea.displayName).toBe("Textarea");
});
