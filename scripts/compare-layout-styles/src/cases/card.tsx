import { Card as EmotionCard } from "@dw/ui-emotion";
import { Card as TailwindCard } from "@dw/ui";
import type { LayoutCase } from "../case";

const pixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const variants = ["default", "stroke"] as const;
const directions = ["vertical", "horizontal"] as const;

export const cardCases: LayoutCase[] = [
  ...variants.flatMap((variant) =>
    directions.map((direction) => ({
      id: ["card", variant, direction].join("/"),
      tailwind: <TailwindCard variant={variant} direction={direction} title="Title" body="Body" />,
      emotion: <EmotionCard variant={variant} direction={direction} title="Title" body="Body" />,
    })),
  ),
  {
    id: "card/stroke/horizontal/image",
    tailwind: (
      <TailwindCard variant="stroke" direction="horizontal" title="Title" body="Body" icon={null} imageSrc={pixel} />
    ),
    emotion: (
      <EmotionCard variant="stroke" direction="horizontal" title="Title" body="Body" icon={null} imageSrc={pixel} />
    ),
  },
];
