import { AvatarBlock as EmotionAvatarBlock } from "@dw/ui-emotion";
import { AvatarBlock as TailwindAvatarBlock } from "@dw/ui";
import type { LayoutCase } from "../case";

const pixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const avatarBlockCases: LayoutCase[] = [
  {
    id: "avatar-block/image",
    tailwind: <TailwindAvatarBlock title="Title" description="Body" src={pixel} alt="" />,
    emotion: <EmotionAvatarBlock title="Title" description="Body" src={pixel} alt="" />,
  },
  {
    id: "avatar-block/initial",
    tailwind: <TailwindAvatarBlock type="initial" initials="AL" title="Title" />,
    emotion: <EmotionAvatarBlock type="initial" initials="AL" title="Title" />,
  },
];
