import { render, screen } from "@testing-library/react";
import { Notification } from "./Notification";

test("message shows title, body, action, and dismiss", () => {
  const onAction = jest.fn();
  const onDismiss = jest.fn();
  render(
    <Notification title="Title" body="Body text." action="Button" onAction={onAction} onDismiss={onDismiss} />,
  );
  const frame = screen.getByRole("status");
  expect(frame.className).toContain("bg-(--color-bg-default)");
  expect(frame.className).toContain("text-(--color-fg-default)");
  expect(frame.className).toContain("border-(--color-border-default-secondary)");
  expect(frame.className).toContain("w-(--size-notification)");
  expect(screen.getByText("Title").className).toContain("font-semibold");
  expect(screen.getByText("Body text.")).toBeTruthy();
  const action = screen.getByRole("button", { name: "Button" });
  expect(action.className).toContain("bg-(--color-bg-brand)");
  expect(action.className).toContain("h-(--size-icon-medium)");
  action.click();
  expect(onAction).toHaveBeenCalledTimes(1);
  const dismiss = screen.getByRole("button", { name: "Dismiss" });
  expect(dismiss.className).toContain("size-(--size-icon-button-small)");
  expect(dismiss.className).toContain("text-(--color-fg-default)");
  expect(dismiss.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 20 20");
  dismiss.click();
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(frame.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 20 20");
});

test("alert uses danger button and the small close icon", () => {
  render(<Notification variant="alert" title="Title" body="Body text." action="Button" />);
  const frame = screen.getByRole("alert");
  expect(frame.className).toContain("bg-(--color-bg-danger-tertiary)");
  expect(frame.className).toContain("text-(--color-fg-danger)");
  expect(frame.className).toContain("border-(--color-border-danger-tertiary)");
  expect(screen.getByRole("button", { name: "Button" }).className).toContain("bg-(--color-bg-danger)");
  const dismiss = screen.getByRole("button", { name: "Dismiss" });
  expect(dismiss.className).toContain("size-(--size-icon-large)");
  expect(dismiss.className).toContain("text-(--color-fg-danger)");
  expect(dismiss.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 16 16");
});

test("hides icon, action, and dismiss when omitted", () => {
  render(<Notification title="Title" icon={null} dismissible={false} />);
  const frame = screen.getByRole("status");
  expect(frame.querySelector("svg")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.queryByText("Body text.")).toBeNull();
});

test("exposes displayName", () => {
  expect(Notification.displayName).toBe("Notification");
});
