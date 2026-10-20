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

test("secondary sm uses those classes", () => {
  render(
    <Button variant="secondary" size="sm">
      Add
    </Button>,
  );
  const className = screen.getByRole("button", { name: "Add" }).className;
  expect(className).toContain("bg-btn-secondary");
  expect(className).toContain("border-btn-secondary-border");
  expect(className).not.toMatch(/(^|\s)border-transparent(\s|$)/);
  expect(className).toContain("h-btn-sm");
  expect(className).toContain("px-btn-x-sm");
  expect(className).toContain("text-btn-sm");
  expect(className).toContain("border-btn");
  expect(className).toContain("disabled:opacity-btn-disabled");
});

test("tertiary uses that class", () => {
  render(<Button variant="tertiary">Add</Button>);
  expect(screen.getByRole("button", { name: "Add" }).className).toContain(
    "bg-btn-tertiary",
  );
});

test("icon-text shows the plus and the label", () => {
  render(<Button content="icon-text">Add</Button>);
  const button = screen.getByRole("button", { name: "Add" });
  expect(button.querySelector("svg")).toBeTruthy();
  expect(button.querySelector(".sr-only")).toBeNull();
});

test("icon keeps the accessible name", () => {
  render(<Button content="icon">Add</Button>);
  const button = screen.getByRole("button", { name: "Add" });
  expect(button.querySelector("svg")).toBeTruthy();
  expect(button.querySelector(".sr-only")?.textContent).toBe("Add");
});

test("exposes displayName", () => {
  expect(Button.displayName).toBe("Button");
});
