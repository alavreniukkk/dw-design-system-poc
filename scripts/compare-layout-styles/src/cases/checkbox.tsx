import { Checkbox as EmotionCheckbox } from "@dw/ui-emotion";
import { Checkbox as TailwindCheckbox } from "../../../../packages/ui/src/components/atoms/Checkbox/Checkbox";
import type { LayoutCase } from "../case";

export const checkboxCases: LayoutCase[] = [
  {
    id: "checkbox/unchecked",
    tailwind: <TailwindCheckbox label="Label" />,
    emotion: <EmotionCheckbox label="Label" />,
  },
  {
    id: "checkbox/checked",
    tailwind: <TailwindCheckbox label="Label" defaultChecked />,
    emotion: <EmotionCheckbox label="Label" defaultChecked />,
  },
  {
    id: "checkbox/indeterminate",
    tailwind: <TailwindCheckbox label="Label" indeterminate />,
    emotion: <EmotionCheckbox label="Label" indeterminate />,
  },
  {
    id: "checkbox/disabled",
    disabled: true,
    tailwind: <TailwindCheckbox label="Label" disabled />,
    emotion: <EmotionCheckbox label="Label" disabled />,
  },
  {
    id: "checkbox/description",
    tailwind: <TailwindCheckbox label="Label" description="Help" />,
    emotion: <EmotionCheckbox label="Label" description="Help" />,
  },
];
