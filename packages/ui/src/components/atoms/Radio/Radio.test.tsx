import { render, screen } from "@testing-library/react";
import { Radio } from "./Radio";

test("checks the radio", () => {
  render(<Radio name="group" label="Label" description="Description" />);
  const radio = screen.getByRole("radio", { name: "Label" });
  radio.click();
  expect((radio as HTMLInputElement).checked).toBe(true);
});

test("exposes displayName", () => {
  expect(Radio.displayName).toBe("Radio");
});
