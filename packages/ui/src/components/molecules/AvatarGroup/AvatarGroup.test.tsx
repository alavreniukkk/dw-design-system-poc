import { render, screen } from "@testing-library/react";
import { Avatar } from "../../atoms/Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup";

test("shows the overflow count", () => {
  render(
    <AvatarGroup overflow={1} spacing="overlap">
      <Avatar type="initial" initials="A" />
      <Avatar type="initial" initials="B" />
    </AvatarGroup>,
  );
  expect(screen.getByText("+1")).toBeTruthy();
  const stack = screen.getByText("A").parentElement?.parentElement;
  expect(stack?.className).toContain("-mr-200");
  expect(stack?.className).toContain("shadow-200");
});

test("exposes displayName", () => {
  expect(AvatarGroup.displayName).toBe("AvatarGroup");
});
