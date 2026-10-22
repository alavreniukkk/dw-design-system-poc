import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("calls onClick", () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Add</Button>);
  screen.getByRole("button", { name: "Add" }).click();
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("disabled does not call onClick", () => {
  const onClick = jest.fn();
  render(
    <Button disabled onClick={onClick}>
      Add
    </Button>,
  );
  screen.getByRole("button", { name: "Add" }).click();
  expect(onClick).not.toHaveBeenCalled();
});

test("neutral small uses those classes", () => {
  render(
    <Button variant="neutral" size="small">
      Add
    </Button>,
  );
  const className = screen.getByRole("button", { name: "Add" }).className;
  expect(className).toContain("bg-(--color-bg-neutral-tertiary)");
  expect(className).toContain("border-(--color-border-neutral-secondary)");
  expect(className).toContain("h-(--size-icon-medium)");
  expect(className).toContain("px-200");
  expect(className).toContain("text-03");
  expect(className).toContain("border");
  expect(className).toContain("disabled:bg-(--color-bg-disabled)");
});

test("subtle uses that class", () => {
  render(<Button variant="subtle">Add</Button>);
  const className = screen.getByRole("button", { name: "Add" }).className;
  expect(className).toContain("bg-transparent");
  expect(className).toContain("hover:border-(--color-border-default)");
});

test("exposes displayName", () => {
  expect(Button.displayName).toBe("Button");
});
