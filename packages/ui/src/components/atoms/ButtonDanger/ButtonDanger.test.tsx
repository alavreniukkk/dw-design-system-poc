import { render, screen } from "@testing-library/react";
import { ButtonDanger } from "./ButtonDanger";

test("calls onClick", () => {
  const onClick = jest.fn();
  render(<ButtonDanger onClick={onClick}>Delete</ButtonDanger>);
  screen.getByRole("button", { name: "Delete" }).click();
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("disabled does not call onClick", () => {
  const onClick = jest.fn();
  render(
    <ButtonDanger disabled onClick={onClick}>
      Delete
    </ButtonDanger>,
  );
  screen.getByRole("button", { name: "Delete" }).click();
  expect(onClick).not.toHaveBeenCalled();
});

test("subtle small uses those classes", () => {
  render(
    <ButtonDanger variant="subtle" size="small">
      Delete
    </ButtonDanger>,
  );
  const className = screen.getByRole("button", { name: "Delete" }).className;
  expect(className).toContain("bg-button-danger-subtle");
  expect(className).toContain("border-button-danger-subtle-border");
  expect(className).toContain("h-button-danger-small");
  expect(className).toContain("px-button-danger-x-small");
  expect(className).toContain("py-button-danger-y-small");
  expect(className).toContain("text-button-danger-small");
  expect(className).toContain("border-button-danger");
  expect(className).toContain("hover:bg-button-danger-subtle-hover");
  expect(className).toContain("disabled:bg-button-danger-disabled");
});

test("primary uses that class", () => {
  render(<ButtonDanger variant="primary">Delete</ButtonDanger>);
  const className = screen.getByRole("button", { name: "Delete" }).className;
  expect(className).toContain("bg-button-danger-primary");
  expect(className).toContain("hover:border-button-danger-primary-hover-border");
});

test("exposes displayName", () => {
  expect(ButtonDanger.displayName).toBe("ButtonDanger");
});
