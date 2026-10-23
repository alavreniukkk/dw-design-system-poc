import { Textarea as EmotionTextarea } from "@dw/ui-emotion";
import { Textarea as TailwindTextarea } from "../../../../packages/ui/src/components/atoms/Textarea/Textarea";
import type { LayoutCase } from "../case";

export const textareaCases: LayoutCase[] = [
  {
    id: "textarea/label",
    tailwind: <TailwindTextarea label="Label" />,
    emotion: <EmotionTextarea label="Label" />,
  },
  {
    id: "textarea/disabled",
    disabled: true,
    tailwind: <TailwindTextarea label="Label" disabled />,
    emotion: <EmotionTextarea label="Label" disabled />,
  },
];
