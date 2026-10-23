import { Avatar as EmotionAvatar, AvatarGroup as EmotionAvatarGroup } from "@dw/ui-emotion";
import { Avatar as TailwindAvatar, AvatarGroup as TailwindAvatarGroup } from "@dw/ui";
import type { LayoutCase } from "../case";

const pixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const tailwindFaces = (
  <>
    <TailwindAvatar src={pixel} alt="" />
    <TailwindAvatar src={pixel} alt="" />
  </>
);

const emotionFaces = (
  <>
    <EmotionAvatar src={pixel} alt="" />
    <EmotionAvatar src={pixel} alt="" />
  </>
);

export const avatarGroupCases: LayoutCase[] = [
  {
    id: "avatar-group/spaced",
    tailwind: <TailwindAvatarGroup spacing="spaced">{tailwindFaces}</TailwindAvatarGroup>,
    emotion: <EmotionAvatarGroup spacing="spaced">{emotionFaces}</EmotionAvatarGroup>,
  },
  {
    id: "avatar-group/overlap",
    tailwind: <TailwindAvatarGroup spacing="overlap">{tailwindFaces}</TailwindAvatarGroup>,
    emotion: <EmotionAvatarGroup spacing="overlap">{emotionFaces}</EmotionAvatarGroup>,
  },
  {
    id: "avatar-group/overflow",
    tailwind: (
      <TailwindAvatarGroup spacing="spaced" overflow={2}>
        {tailwindFaces}
      </TailwindAvatarGroup>
    ),
    emotion: (
      <EmotionAvatarGroup spacing="spaced" overflow={2}>
        {emotionFaces}
      </EmotionAvatarGroup>
    ),
  },
];
