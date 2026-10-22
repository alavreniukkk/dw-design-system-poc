import { fireEvent, render, screen } from "@testing-library/react";
import { Accordion } from "./Accordion";

test("opens the panel", () => {
  render(<Accordion title="Title">Answer</Accordion>);
  expect(screen.queryByText("Answer")).toBeNull();
  const header = screen.getByRole("button", { name: "Title" });
  expect(header.className).toContain("w-full");
  expect(header.className).toContain("p-400");
  fireEvent.click(header);
  expect(screen.getByText("Answer")).toBeTruthy();
  expect(header.getAttribute("aria-expanded")).toBe("true");
});

test("exposes displayName", () => {
  expect(Accordion.displayName).toBe("Accordion");
});
