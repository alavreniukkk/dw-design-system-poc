import { render, screen } from "@testing-library/react";
import { Tag } from "./Tag";

test("removes when the icon button is clicked", () => {
  const onRemove = jest.fn();
  render(
    <Tag scheme="danger" variant="secondary" onRemove={onRemove}>
      Tag
    </Tag>,
  );
  expect(screen.getByText("Tag").className).toContain("bg-(--color-bg-danger-secondary)");
  screen.getByRole("button", { name: "Remove" }).click();
  expect(onRemove).toHaveBeenCalledTimes(1);
});

test("exposes displayName", () => {
  expect(Tag.displayName).toBe("Tag");
});
