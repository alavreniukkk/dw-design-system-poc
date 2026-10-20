declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  const Content: FC<SVGProps<SVGSVGElement>>;
  export default Content;
}
