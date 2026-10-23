import { Avatar as EmotionAvatar } from "@dw/ui-emotion";
import { Avatar as TailwindAvatar } from "@dw/ui";
import type { LayoutCase } from "../case";

const pixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const sizes = ["large", "medium", "small"] as const;
const shapes = ["circle", "square"] as const;

export const avatarCases: LayoutCase[] = sizes.flatMap((size) =>
  shapes.flatMap((shape) => [
    {
      id: ["avatar", "image", size, shape].join("/"),
      tailwind: <TailwindAvatar type="image" size={size} shape={shape} src={pixel} alt="" />,
      emotion: <EmotionAvatar type="image" size={size} shape={shape} src={pixel} alt="" />,
    },
    {
      id: ["avatar", "initial", size, shape].join("/"),
      tailwind: <TailwindAvatar type="initial" size={size} shape={shape} initials="AL" />,
      emotion: <EmotionAvatar type="initial" size={size} shape={shape} initials="AL" />,
    },
  ]),
);
