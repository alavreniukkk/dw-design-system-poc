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
  expect(button.className).toContain("bg-icon-button-neutral");
  expect(button.className).toContain("border-icon-button-neutral-border");
  expect(button.className).toContain("h-icon-button-small");
  expect(button.className).toContain("w-icon-button-small");
  expect(button.className).toContain("text-icon-button-neutral-fg");
  expect(button.className).toContain("border-icon-button");
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
    "hover:bg-icon-button-subtle-hover",
  );
});

test("exposes displayName", () => {
  expect(IconButton.displayName).toBe("IconButton");
});
