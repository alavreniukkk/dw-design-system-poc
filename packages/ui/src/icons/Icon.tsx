import type { SVGProps } from "react";
import Check from "./check.svg";
import ChevronDown from "./chevron-down.svg";
import ChevronUp from "./chevron-up.svg";
import Info from "./info.svg";
import Plus from "./plus.svg";
import Search from "./search.svg";
import Star from "./star.svg";
import X from "./x.svg";
import XSmall from "./x-small.svg";

const icons = {
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  info: Info,
  plus: Plus,
  search: Search,
  star: Star,
  x: X,
  "x-small": XSmall,
} as const;

export type IconName = keyof typeof icons;

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export const Icon = ({ name, ...props }: IconProps) => {
  const Svg = icons[name];
  return <Svg {...props} />;
};
