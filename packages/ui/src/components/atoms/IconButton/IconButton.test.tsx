import { render, screen } from "@testing-library/react";
import { IconButton } from "./IconButton";

test("calls onClick", () => {
  const onClick = jest.fn();
  render(
    <IconButton icon="star" onClick={onClick}>
      Star
    </IconButton>,
  );
  screen.getByRole("button", { name: "Star" }).click();
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("disabled does not call onClick", () => {
  const onClick = jest.fn();
  render(
    <IconButton icon="star" disabled onClick={onClick}>
      Star
    </IconButton>,
  );
  screen.getByRole("button", { name: "Star" }).click();
  expect(onClick).not.toHaveBeenCalled();
});

test("neutral small uses those classes", () => {
  render(
    <IconButton icon="plus" variant="neutral" size="small">
      Star
    </IconButton>,
  );
  const button = screen.getByRole("button", { name: "Star" });
  expect(button.className).toContain("bg-(--color-bg-default-secondary)");
  expect(button.className).toContain("border-(--color-border-default)");
  expect(button.className).toContain("size-(--size-icon-button-small)");
  expect(button.className).toContain("text-(--color-fg-default)");
  expect(button.className).toContain("border");
  expect(button.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 16 16");
  expect(button.querySelector(".sr-only")?.textContent).toBe("Star");
});

test("subtle uses that class", () => {
  render(
    <IconButton icon="star" variant="subtle">
      Star
    </IconButton>,
  );
  expect(screen.getByRole("button", { name: "Star" }).className).toContain(
    "hover:bg-(--color-bg-default-hover)",
  );
});

test("exposes displayName", () => {
  expect(IconButton.displayName).toBe("IconButton");
});
