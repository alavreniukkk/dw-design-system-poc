import { Notification as EmotionNotification } from "@dw/ui-emotion";
import { Notification as TailwindNotification } from "@dw/ui";
import type { LayoutCase } from "../case";

const variants = ["message", "alert"] as const;

export const notificationCases: LayoutCase[] = [
  ...variants.map((variant) => ({
    id: ["notification", variant].join("/"),
    tailwind: <TailwindNotification variant={variant} title="Title" body="Body" />,
    emotion: <EmotionNotification variant={variant} title="Title" body="Body" />,
  })),
  {
    id: "notification/message/action",
    tailwind: <TailwindNotification variant="message" title="Title" body="Body" action="Action" />,
    emotion: <EmotionNotification variant="message" title="Title" body="Body" action="Action" />,
  },
];
