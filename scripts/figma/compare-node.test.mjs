import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  applySourceFixes,
  classesFor,
  compareModel,
  hasIssues,
  parseCva,
  parseTheme,
  parseTokens,
  pruneIssues,
  targetFromArg,
} from "./compare-node.mjs";

const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (path) => readFileSync(`${root}/${path}`, "utf8");

const color = (hex) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 };
};

const frame = (name, paint) => ({
  name,
  fills: paint.bg ? [{ type: "SOLID", color: color(paint.bg) }] : [],
  strokes: paint.border ? [{ type: "SOLID", color: color(paint.border) }] : [],
  strokeWeight: paint.border ? 1 : 0,
  cornerRadius: paint.radius ?? undefined,
  absoluteBoundingBox: { width: paint.width ?? 120, height: paint.height ?? 40 },
  paddingLeft: paint.padX,
  paddingRight: paint.padX,
  paddingTop: paint.padY ?? 0,
  paddingBottom: paint.padY ?? 0,
  children: paint.fg
    ? [
        {
          type: "TEXT",
          fills: [{ type: "SOLID", color: color(paint.fg) }],
          style: { fontSize: paint.fontSize ?? 16, lineHeightPx: 16, fontFamily: "Inter" },
        },
      ]
    : [],
});

describe("targetFromArg", () => {
  it("uses the branch key and every hyphen in the node id", () => {
    const parsed = targetFromArg(
      "https://www.figma.com/design/FILE/branch/BRANCH/Name?node-id=12-34-56",
    );
    assert.equal(parsed.fileKey, "BRANCH");
    assert.equal(parsed.nodeId, "12:34:56");
  });
});

describe("parseCva", () => {
  it("reads axes without depending on indentation", () => {
    const avatar = parseCva(read("packages/ui/src/components/atoms/Avatar/Avatar.tsx"));
    assert.deepEqual(Object.keys(avatar.variants).sort(), ["shape", "size", "type"]);
    assert.deepEqual(Object.keys(avatar.variants.size).sort(), ["large", "medium", "small"]);
    assert.equal(avatar.compounds.length, 3);

    const button = parseCva(read("packages/ui/src/components/atoms/Button/Button.tsx"));
    assert.deepEqual(Object.keys(button.variants.variant).sort(), ["neutral", "primary", "subtle"]);

    const tag = parseCva(read("packages/ui/src/components/atoms/Tag/Tag.tsx"));
    assert.deepEqual(Object.keys(tag.variants).sort(), ["scheme", "variant"]);
    assert.equal(tag.compounds.length, 10);

    const type = parseCva(read("packages/ui/src/components/atoms/Typography/Typography.tsx"));
    assert.ok(type.variants.variant["title-hero"]);
    assert.ok(type.variants.tone.danger);

    for (const path of [
      "packages/ui/src/components/molecules/Card/Card.tsx",
      "packages/ui/src/components/molecules/ButtonGroup/ButtonGroup.tsx",
      "packages/ui/src/components/molecules/Notification/Notification.tsx",
      "packages/ui/src/components/atoms/IconButton/IconButton.tsx",
    ]) {
      const parsed = parseCva(read(path));
      assert.ok(Object.keys(parsed.variants).length > 0, path);
    }
  });

  it("applies compound classes for the selected props", () => {
    const tag = parseCva(read("packages/ui/src/components/atoms/Tag/Tag.tsx"));
    const { parts } = classesFor(tag, { scheme: "brand", variant: "primary" });
    assert.match(parts.map((part) => part.text).join(" "), /--color-bg-brand\b/);
  });
});

describe("compareModel", () => {
  const tokensCss = read("packages/ui/src/styles/tokens.css");
  const themeCss = read("packages/ui/src/styles/theme.css");
  const buttonPath = "packages/ui/src/components/atoms/Button/Button.tsx";
  const buttonSource = read(buttonPath);
  const tokens = parseTokens(tokensCss);
  const theme = parseTheme(themeCss, tokens);

  const buttonPaint = (state) => {
    if (state === "hover") {
      return {
        bg: tokens.resolve("--color-bg-brand-hover"),
        fg: tokens.resolve("--color-fg-on-brand"),
        border: tokens.resolve("--color-border-brand"),
      };
    }
    if (state === "disabled") {
      return {
        bg: tokens.resolve("--color-bg-disabled"),
        fg: tokens.resolve("--color-fg-disabled-on"),
        border: tokens.resolve("--color-border-disabled"),
      };
    }
    return {
      bg: tokens.resolve("--color-bg-brand"),
      fg: tokens.resolve("--color-fg-on-brand"),
      border: tokens.resolve("--color-border-brand"),
    };
  };

  const buttonSet = () => ({
    name: "Button",
    children: ["default", "hover", "disabled"].map((state) =>
      frame(`Variant=Primary, Size=Medium, State=${state[0].toUpperCase()}${state.slice(1)}`, {
        ...buttonPaint(state),
        radius: Number.parseFloat(theme.radius.get("200")),
        height: Number.parseFloat(tokens.resolve("--size-icon-large")),
        padX: Number.parseFloat(theme.spacing.get("300")),
        fontSize: Number.parseFloat(theme.text.get("03")),
      }),
    ),
  });

  it("accepts the current Button when Figma matches the classes", () => {
    const result = compareModel({
      source: buttonSource,
      document: buttonSet(),
      tokensCss,
      themeCss,
      tsxFiles: [{ path: buttonPath, source: buttonSource }],
      filePath: buttonPath,
    });
    assert.deepEqual(result.issues, {});
    assert.equal(result.sourceFixes.length, 0);
    assert.equal(result.tokenFixes.length, 0);
  });

  it("retargets a class when one semantic token matches the new color", () => {
    const css = `:root {
  /* primitive */
  --color-brand-800: #111111;
  --color-slate-700: #222222;
  /* semantic */
  --color-bg-brand: var(--color-brand-800);
  --color-bg-neutral: var(--color-slate-700);
}
`;
    const source = `const buttonVariants = cva("inline-flex", {
      variants: {
        variant: {
          primary: "bg-(--color-bg-brand)",
        },
      },
    });
    export const Button = ({ variant }) => variant;`;
    const result = compareModel({
      source,
      document: {
        name: "Button",
        children: [frame("Variant=Primary, State=Default", { bg: "#222222", height: 40, width: 40 })],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path: buttonPath, source }],
      filePath: buttonPath,
    });
    assert.equal(result.sourceFixes.length, 1);
    assert.equal(result.sourceFixes[0].from, "bg-(--color-bg-brand)");
    assert.equal(result.sourceFixes[0].to, "bg-(--color-bg-neutral)");
    assert.equal(result.issues.drift, undefined);
  });

  it("does not pick a shared color when more than one semantic token matches", () => {
    const css = `:root {
  /* semantic */
  --color-bg-brand: #111111;
  --color-bg-default: #FFFFFF;
  --color-bg-neutral: #FFFFFF;
}
`;
    const source = `const buttonVariants = cva("", {
      variants: { variant: { primary: "bg-(--color-bg-brand)" } },
    });
    export const Button = ({ variant }) => variant;`;
    const result = compareModel({
      source,
      document: {
        name: "Button",
        children: [frame("Variant=Primary", { bg: "#FFFFFF", height: 40, width: 40 })],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path: buttonPath, source }],
      filePath: buttonPath,
    });
    assert.equal(result.sourceFixes.length, 0);
    assert.equal(result.issues.drift.length, 1);
    assert.deepEqual(result.issues.drift[0].candidates.sort(), [
      "bg-(--color-bg-default)",
      "bg-(--color-bg-neutral)",
    ]);
  });

  it("updates a literal token that only this file uses", () => {
    const css = `:root {\n  /* component */\n  --size-widget: 44px;\n}\n`;
    const path = "packages/ui/src/components/atoms/Widget/Widget.tsx";
    const source = `const widgetVariants = cva("", {
      variants: { size: { medium: "h-(--size-widget)" } },
    });
    export const Widget = ({ size }) => size;`;
    const result = compareModel({
      source,
      document: {
        name: "Widget",
        children: [frame("Size=Medium", { height: 46, width: 46 })],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path, source }],
      filePath: path,
    });
    assert.deepEqual(result.tokenFixes, [{ name: "--size-widget", value: "46px" }]);
    assert.equal(applyToken(css, result.tokenFixes).includes("--size-widget: 46px;"), true);
  });

  it("leaves a shared size token alone", () => {
    const css = `:root {\n  /* primitive */\n  --size-icon-large: 40px;\n}\n`;
    const source = `const buttonVariants = cva("", {
      variants: { size: { medium: "h-(--size-icon-large)" } },
    });
    export const Button = ({ size }) => size;`;
    const other = "packages/ui/src/components/atoms/IconButton/IconButton.tsx";
    const result = compareModel({
      source,
      document: {
        name: "Button",
        children: [frame("Size=Medium", { height: 46, width: 80 })],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [
        { path: buttonPath, source },
        { path: other, source: "h-(--size-icon-large)" },
      ],
      filePath: buttonPath,
    });
    assert.equal(result.tokenFixes.length, 0);
    assert.equal(result.issues.drift[0].role, "height");
  });

  it("reports a missing variant and an axis the component does not have", () => {
    const source = `const buttonVariants = cva("", {
      variants: { variant: { primary: "bg-transparent" } },
    });
    export const Button = ({ variant }) => variant;`;
    const result = compareModel({
      source,
      document: {
        name: "Button",
        children: [
          frame("Variant=Primary", { bg: "#111111" }),
          frame("Variant=Ghost, Direction=Horizontal", { bg: "#111111" }),
        ],
      },
      tokensCss: `:root { /* semantic */ --color-bg-brand: #111111; }`,
      themeCss: "",
      tsxFiles: [{ path: buttonPath, source }],
      filePath: buttonPath,
    });
    assert.deepEqual(result.issues.values, { variant: ["ghost"] });
    assert.deepEqual(result.issues.axes, { direction: ["horizontal"] });
    assert.ok(result.issues.samples.some((sample) => sample.props.variant === "ghost"));
  });

  it("keeps the shared size when one variant differs and writes that size on the branch", () => {
    const css = `:root {\n  /* component */\n  --size-notification: 300px;\n}\n`;
    const path = "packages/ui/src/components/molecules/Notification/Notification.tsx";
    const source = `const notificationVariants = cva("flex w-(--size-notification) items-start", {
      variants: { variant: { message: "border-solid", alert: "border-solid" } },
    });
    export const Notification = ({ variant }) => variant;`;
    const result = compareModel({
      source,
      document: {
        name: "Notification",
        children: [
          frame("Variant=Message", { width: 320, height: 80 }),
          frame("Variant=Alert", { width: 300, height: 80 }),
        ],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path, source }],
      filePath: path,
    });
    assert.deepEqual(result.tokenFixes, []);
    assert.equal(result.issues.drift, undefined);
    const next = applySourceFixes(source, result.sourceFixes);
    assert.match(next, /message: "border-solid w-\[320px\]"/);
    assert.match(next, /alert: "border-solid w-\(--size-notification\)"/);
    assert.doesNotMatch(next.slice(0, next.indexOf("variants")), /w-\(--size-notification\)/);
    const again = compareModel({
      source: next,
      document: {
        name: "Notification",
        children: [
          frame("Variant=Message", { width: 320, height: 80 }),
          frame("Variant=Alert", { width: 300, height: 80 }),
        ],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path, source: next }],
      filePath: path,
    });
    assert.deepEqual(again.tokenFixes, []);
    assert.deepEqual(again.sourceFixes, []);
    assert.deepEqual(again.issues, {});
  });

  it("updates the shared size when every variant wants the same new value", () => {
    const css = `:root {\n  /* component */\n  --size-notification: 300px;\n}\n`;
    const path = "packages/ui/src/components/molecules/Notification/Notification.tsx";
    const source = `const notificationVariants = cva("w-(--size-notification)", {
      variants: { variant: { message: "border-solid", alert: "border-solid" } },
    });
    export const Notification = ({ variant }) => variant;`;
    const result = compareModel({
      source,
      document: {
        name: "Notification",
        children: [
          frame("Variant=Message", { width: 320, height: 40 }),
          frame("Variant=Alert", { width: 320, height: 40 }),
        ],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path, source }],
      filePath: path,
    });
    assert.deepEqual(result.tokenFixes, [{ name: "--size-notification", value: "320px" }]);
    assert.equal(result.sourceFixes.length, 0);
  });

  it("moves one variant color onto that branch when a single token matches", () => {
    const css = `:root {
      /* semantic */
      --color-bg-brand: #111111;
      --color-bg-danger: #FF0000;
    }`;
    const path = "packages/ui/src/components/molecules/Notification/Notification.tsx";
    const source = `const notificationVariants = cva("bg-(--color-bg-brand)", {
      variants: { variant: { message: "border-solid", alert: "border-solid" } },
    });
    export const Notification = ({ variant }) => variant;`;
    const result = compareModel({
      source,
      document: {
        name: "Notification",
        children: [
          frame("Variant=Message", { bg: "#FF0000", width: 120, height: 40 }),
          frame("Variant=Alert", { bg: "#111111", width: 120, height: 40 }),
        ],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path, source }],
      filePath: path,
    });
    assert.deepEqual(result.tokenFixes, []);
    assert.equal(result.issues.drift, undefined);
    const next = applySourceFixes(source, result.sourceFixes);
    assert.match(next, /message: "border-solid bg-\(--color-bg-danger\)"/);
    assert.match(next, /alert: "border-solid bg-\(--color-bg-brand\)"/);
    assert.doesNotMatch(next.slice(0, next.indexOf("variants")), /bg-\(--color-bg-brand\)/);
  });

  it("asks for a variant override when one variant color has several tokens", () => {
    const css = `:root {
      /* semantic */
      --color-bg-default: #FFFFFF;
      --color-bg-neutral: #FFFFFF;
      --color-bg-brand: #111111;
    }`;
    const path = "packages/ui/src/components/molecules/Notification/Notification.tsx";
    const source = `const notificationVariants = cva("bg-(--color-bg-brand)", {
      variants: { variant: { message: "border-solid", alert: "border-solid" } },
    });
    export const Notification = ({ variant }) => variant;`;
    const result = compareModel({
      source,
      document: {
        name: "Notification",
        children: [
          frame("Variant=Message", { bg: "#FFFFFF", width: 120, height: 40 }),
          frame("Variant=Alert", { bg: "#111111", width: 120, height: 40 }),
        ],
      },
      tokensCss: css,
      themeCss: "",
      tsxFiles: [{ path, source }],
      filePath: path,
    });
    assert.deepEqual(result.tokenFixes, []);
    assert.equal(result.sourceFixes.length, 0);
    assert.equal(result.issues.drift[0].kind, "variant-override");
    assert.equal(result.issues.drift[0].axis, "variant");
    assert.equal(result.issues.drift[0].branches.find((row) => row.props.variant === "message").class, null);
  });

  it("keeps a scheme axis when cva already has it", () => {
    const source = `const tagVariants = cva("", {
      variants: { scheme: { brand: "bg-(--color-bg-brand)" } },
    });
    export const Tag = ({ scheme }) => scheme;`;
    const result = compareModel({
      source,
      document: {
        name: "Tag",
        children: [frame("Scheme=Brand", { bg: "#111111", height: 32, width: 64 })],
      },
      tokensCss: `:root { /* semantic */ --color-bg-brand: #111111; }`,
      themeCss: "",
      tsxFiles: [{ path: "packages/ui/src/components/atoms/Tag/Tag.tsx", source }],
      filePath: "packages/ui/src/components/atoms/Tag/Tag.tsx",
    });
    assert.equal(result.issues.axes, undefined);
    assert.equal(result.issues.values, undefined);
    assert.deepEqual(result.issues, {});
  });
});

describe("pruneIssues", () => {
  it("treats an empty drift list as no issue", () => {
    assert.equal(hasIssues(pruneIssues({ drift: [] })), false);
    assert.equal(hasIssues(pruneIssues({})), false);
    assert.equal(hasIssues(pruneIssues({ drift: [{ role: "width", figma: "310px" }] })), true);
  });
});

describe("applySourceFixes", () => {
  it("replaces the token only inside the branch that owned it", () => {
    const source = `primary: "bg-(--color-bg-brand)"
neutral: "bg-(--color-bg-neutral)"`;
    const next = applySourceFixes(source, [
      { start: source.indexOf("bg-(--color-bg-brand)"), end: source.indexOf("bg-(--color-bg-brand)") + "bg-(--color-bg-brand)".length, from: "bg-(--color-bg-brand)", to: "bg-(--color-bg-neutral)" },
    ]);
    assert.match(next, /primary: "bg-\(--color-bg-neutral\)"/);
    assert.match(next, /neutral: "bg-\(--color-bg-neutral\)"/);
  });
});

const applyToken = (css, fixes) => {
  let next = css;
  for (const fix of fixes) next = next.replace(`${fix.name}: 44px;`, `${fix.name}: ${fix.value};`);
  return next;
};
