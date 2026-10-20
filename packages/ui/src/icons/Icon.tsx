import type { SVGProps } from "react";
import Plus from "./plus.svg";

const icons = {
  plus: Plus,
} as const;

export type IconName = keyof typeof icons;

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export const Icon = ({ name, ...props }: IconProps) => {
  const Svg = icons[name];
  return <Svg {...props} />;
};
