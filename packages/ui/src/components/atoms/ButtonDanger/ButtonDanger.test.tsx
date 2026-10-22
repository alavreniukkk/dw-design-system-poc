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
  expect(className).toContain("bg-transparent");
  expect(className).toContain("border-transparent");
  expect(className).toContain("h-(--size-icon-medium)");
  expect(className).toContain("px-200");
  expect(className).toContain("text-03");
  expect(className).toContain("border");
  expect(className).toContain("hover:bg-(--color-bg-danger-tertiary-hover)");
  expect(className).toContain("disabled:bg-(--color-bg-disabled)");
});

test("primary uses that class", () => {
  render(<ButtonDanger variant="primary">Delete</ButtonDanger>);
  const className = screen.getByRole("button", { name: "Delete" }).className;
  expect(className).toContain("bg-(--color-bg-danger)");
  expect(className).toContain("hover:border-(--color-border-danger)");
});

test("exposes displayName", () => {
  expect(ButtonDanger.displayName).toBe("ButtonDanger");
});
