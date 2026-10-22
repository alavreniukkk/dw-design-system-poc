import type { ReactNode } from "react";

export type LayoutCase = {
  id: string;
  disabled?: boolean;
  tailwind: ReactNode;
  emotion: ReactNode;
};
