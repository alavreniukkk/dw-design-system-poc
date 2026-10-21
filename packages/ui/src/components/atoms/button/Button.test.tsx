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
  expect(className).toContain("bg-button-neutral");
  expect(className).toContain("border-button-neutral-border");
  expect(className).toContain("h-button-small");
  expect(className).toContain("px-button-x-small");
  expect(className).toContain("py-button-y-small");
  expect(className).toContain("text-button-small");
  expect(className).toContain("border-button");
  expect(className).toContain("disabled:bg-button-disabled");
});

test("subtle uses that class", () => {
  render(<Button variant="subtle">Add</Button>);
  const className = screen.getByRole("button", { name: "Add" }).className;
  expect(className).toContain("bg-button-subtle");
  expect(className).toContain("hover:border-button-subtle-hover-border");
});

test("exposes displayName", () => {
  expect(Button.displayName).toBe("Button");
});
