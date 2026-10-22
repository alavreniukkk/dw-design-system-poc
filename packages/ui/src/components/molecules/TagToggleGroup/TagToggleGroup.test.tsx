import { render, screen } from "@testing-library/react";
import { TagToggle } from "../../atoms/TagToggle/TagToggle";
import { TagToggleGroup } from "./TagToggleGroup";

test("lays tag toggles in a row with space 200", () => {
  render(
    <TagToggleGroup>
      <TagToggle pressed>One</TagToggle>
      <TagToggle>Two</TagToggle>
    </TagToggleGroup>,
  );

  const group = screen.getByRole("group");
  expect(group.className).toContain("inline-flex");
  expect(group.className).toContain("gap-200");
  expect(screen.getByRole("button", { name: "One" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "Two" }).getAttribute("aria-pressed")).toBe("false");
});

test("exposes displayName", () => {
  expect(TagToggleGroup.displayName).toBe("TagToggleGroup");
});
