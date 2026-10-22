import { render, screen } from "@testing-library/react";
import { Button } from "../../atoms/Button/Button";
import { ButtonGroup } from "./ButtonGroup";

const buttons = (
  <>
    <Button variant="subtle">Cancel</Button>
    <Button>Save</Button>
  </>
);

test("justify stretches both buttons", () => {
  render(<ButtonGroup>{buttons}</ButtonGroup>);
  const group = screen.getByRole("group");
  expect(group.className).toContain("gap-400");
  expect(group.className).toContain("[&>*]:flex-1");
  expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
});

test("stack stacks the buttons", () => {
  render(<ButtonGroup align="stack">{buttons}</ButtonGroup>);
  expect(screen.getByRole("group").className).toContain("flex-col");
});

test("end aligns to the end", () => {
  render(<ButtonGroup align="end">{buttons}</ButtonGroup>);
  expect(screen.getByRole("group").className).toContain("justify-end");
});

test("exposes displayName", () => {
  expect(ButtonGroup.displayName).toBe("ButtonGroup");
});
