import { Input as EmotionInput } from "@dw/ui-emotion";
import { Input as TailwindInput } from "../../../../packages/ui/src/components/atoms/Input/Input";
import type { LayoutCase } from "../case";

export const inputCases: LayoutCase[] = [
  {
    id: "input/label",
    tailwind: <TailwindInput label="Label" />,
    emotion: <EmotionInput label="Label" />,
  },
  {
    id: "input/description",
    tailwind: <TailwindInput label="Label" description="Help" />,
    emotion: <EmotionInput label="Label" description="Help" />,
  },
  {
    id: "input/disabled",
    disabled: true,
    tailwind: <TailwindInput label="Label" disabled />,
    emotion: <EmotionInput label="Label" disabled />,
  },
  {
    id: "input/error",
    tailwind: <TailwindInput label="Label" error />,
    emotion: <EmotionInput label="Label" error />,
  },
];
