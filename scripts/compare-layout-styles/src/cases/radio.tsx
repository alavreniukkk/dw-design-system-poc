import { Radio as EmotionRadio } from "@dw/ui-emotion";
import { Radio as TailwindRadio } from "../../../../packages/ui/src/components/atoms/Radio/Radio";
import type { LayoutCase } from "../case";

export const radioCases: LayoutCase[] = [
  {
    id: "radio/unchecked",
    tailwind: <TailwindRadio label="Label" />,
    emotion: <EmotionRadio label="Label" />,
  },
  {
    id: "radio/checked",
    tailwind: <TailwindRadio label="Label" defaultChecked />,
    emotion: <EmotionRadio label="Label" defaultChecked />,
  },
  {
    id: "radio/disabled",
    disabled: true,
    tailwind: <TailwindRadio label="Label" disabled />,
    emotion: <EmotionRadio label="Label" disabled />,
  },
  {
    id: "radio/description",
    tailwind: <TailwindRadio label="Label" description="Help" />,
    emotion: <EmotionRadio label="Label" description="Help" />,
  },
];
