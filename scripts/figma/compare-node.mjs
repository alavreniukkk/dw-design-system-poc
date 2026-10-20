import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { setTimeout as delay } from "node:timers/promises";

const root = fileURLToPath(new URL("../..", import.meta.url));
const outDir = fileURLToPath(new URL("./out/", import.meta.url));
const buttonPath = fileURLToPath(
  new URL("../../packages/ui/src/components/atoms/button/Button.tsx", import.meta.url),
);
const tokensCssPath = fileURLToPath(
  new URL("../../packages/ui/src/styles/tokens.css", import.meta.url),
);
const harnessRoot = fileURLToPath(new URL("../compare-layout-styles/", import.meta.url));
const viteBin = fileURLToPath(new URL("../../node_modules/vite/bin/vite.js", import.meta.url));
const port = 4179;
const origin = `http://127.0.0.1:${port}`;

const allowed = new Set([
  "btn/primary/bg",
  "btn/primary/fg",
  "btn/primary/hover/bg",
  "btn/secondary/bg",
  "btn/secondary/fg",
  "btn/secondary/border",
  "btn/tertiary/bg",
  "btn/tertiary/fg",
  "btn/tertiary/hover/bg",
  "btn/radius",
  "btn/pad-x/md",
  "btn/pad-x/sm",
  "btn/pad-y",
  "btn/height/md",
  "btn/height/sm",
  "btn/font",
  "btn/font-size/md",
  "btn/font-size/sm",
  "btn/gap",
  "btn/icon",
]);

const readBox = (node) => {
  const style = getComputedStyle(node);
  const box = node.getBoundingClientRect();
  const icon = node.querySelector("svg");
  const iconBox = icon ? icon.getBoundingClientRect() : null;
  const px = (value) => `${value}px`;
  return {
    backgroundColor: style.backgroundColor,
    color: style.color,
    borderTopColor: style.borderTopColor,
    fontSize: style.fontSize,
    height: px(box.height),
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    borderRadius: style.borderRadius,
    columnGap: style.columnGap,
    iconWidth: iconBox ? px(iconBox.width) : "",
    iconHeight: iconBox ? px(iconBox.height) : "",
  };
};

const keysIn = (source, group) => {
  const start = source.indexOf(`\n      ${group}: {`);
  const end = source.indexOf("\n      },", start);
  if (start < 0 || end < 0) {
    throw new Error(`Button.tsx has no ${group} group`);
  }
  return [...source.slice(start, end).matchAll(/\n        (?:"([^"]+)"|([A-Za-z0-9-]+)):/g)].map(
    (match) => match[1] ?? match[2],
  );
};

const nums = (value) => String(value).match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

const hexToRgb = (hex) => {
  const raw = hex.slice(1);
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

const colorOf = (value) => {
  const match = String(value).match(/rgba?\(([^)]+)\)/);
  if (!match) {
    return value;
  }
  const [r, g, b, a] = match[1].split(",").map((part) => part.trim());
  if (a === undefined || a === "1") {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const differs = (expected, actual) => {
  if (String(expected).startsWith("#")) {
    return colorOf(actual) !== hexToRgb(expected);
  }
  const exp = nums(expected);
  const act = nums(actual);
  if (exp.length === 0 || act.length === 0) {
    return true;
  }
  if (exp.length === 1) {
    return act.some((value) => Math.abs(value - exp[0]) > 1);
  }
  if (exp.length !== act.length) {
    return true;
  }
  return exp.some((value, index) => Math.abs(value - act[index]) > 1);
};

const writeOut = async (name, body) => {
  await mkdir(outDir, { recursive: true });
  await writeFile(`${outDir}/${name}`, JSON.stringify(body, null, 2));
};

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const syncTokensCss = async (tokens) => {
  let text = await readFile(tokensCssPath, "utf8");
  const changed = [];
  for (const [key, value] of Object.entries(tokens)) {
    if (!allowed.has(key) || typeof value !== "string") {
      continue;
    }
    const variable = `--${key.replaceAll("/", "-")}`;
    const pattern = new RegExp(`(${escapeRegExp(variable)}:\\s*)([^;]+);`);
    const match = text.match(pattern);
    if (!match) {
      const inserted = text.replace(/\n}\s*$/, `\n  ${variable}: ${value};\n}\n`);
      if (inserted === text) {
        throw new Error(`tokens.css has no place for ${variable}`);
      }
      text = inserted;
      changed.push(key);
      continue;
    }
    if (match[2].trim() === value) {
      continue;
    }
    text = text.replace(pattern, `$1${value};`);
    changed.push(key);
  }
  if (changed.length === 0) {
    return changed;
  }
  await writeFile(tokensCssPath, text.endsWith("\n") ? text : `${text}\n`);
  await run("npm", ["run", "build", "-w", "@dw/ui"]);
  console.log(`compare-node: wrote ${changed.join(", ")}`);
  return changed;
};

const loadEnv = async () => {
  const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
  let text = "";
  try {
    text = await readFile(envPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    return;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const splitAt = trimmed.indexOf("=");
    const key = trimmed.slice(0, splitAt).trim();
    let value = trimmed.slice(splitAt + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const propsOf = (name) => {
  const props = {};
  for (const part of name.split(", ")) {
    const [key, value] = part.split("=");
    if (value) {
      props[key] = value;
    }
  }
  return props;
};

const hexOf = (color) => {
  const channel = (value) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
};

const solidHex = (node) => {
  const paint = (node?.fills ?? []).find((item) => item.type === "SOLID" && item.visible !== false);
  return paint ? hexOf(paint.color) : null;
};

const pxOf = (value) => `${Math.round(value)}px`;

const findVariant = (document, wanted) =>
  (document.children ?? []).find((child) => {
    const props = propsOf(child.name);
    return (
      props.Variant === wanted.variant &&
      props.Size === wanted.size &&
      props.Content === wanted.content
    );
  });

const nodeFromDocument = (fileKey, nodeId, document) => {
  const components = document.children ?? [];
  const variants = [...new Set(components.map((child) => propsOf(child.name).Variant).filter(Boolean))];
  const sizes = [...new Set(components.map((child) => propsOf(child.name).Size).filter(Boolean))];
  const tokens = {};
  for (const variant of variants) {
    const sample = findVariant(document, { variant, size: "md", content: "text" })
      ?? components.find((child) => propsOf(child.name).Variant === variant && propsOf(child.name).Content === "text");
    if (!sample) {
      continue;
    }
    const bg = solidHex(sample);
    const label = (sample.children ?? []).find((child) => child.type === "TEXT");
    const fg = solidHex(label);
    if (bg) {
      tokens[`btn/${variant}/bg`] = bg;
    }
    if (fg) {
      tokens[`btn/${variant}/fg`] = fg;
    }
    const stroke = (sample.strokes ?? []).find((item) => item.type === "SOLID" && item.visible !== false);
    if (variant === "secondary" && stroke) {
      tokens["btn/secondary/border"] = hexOf(stroke.color);
    }
  }
  for (const size of sizes) {
    const sample = findVariant(document, { variant: "primary", size, content: "text" })
      ?? components.find((child) => propsOf(child.name).Size === size && propsOf(child.name).Content === "text");
    if (!sample) {
      continue;
    }
    const label = (sample.children ?? []).find((child) => child.type === "TEXT");
    if (sample.absoluteBoundingBox) {
      tokens[`btn/height/${size}`] = pxOf(sample.absoluteBoundingBox.height);
    }
    if (Number.isFinite(sample.paddingLeft)) {
      tokens[`btn/pad-x/${size}`] = pxOf(sample.paddingLeft);
    }
    if (Number.isFinite(sample.paddingTop)) {
      tokens["btn/pad-y"] = pxOf(sample.paddingTop);
    }
    if (Number.isFinite(sample.cornerRadius)) {
      tokens["btn/radius"] = pxOf(sample.cornerRadius);
    }
    if (label?.style?.fontSize) {
      tokens[`btn/font-size/${size}`] = pxOf(label.style.fontSize);
    }
  }
  const iconText = findVariant(document, { variant: "primary", size: "md", content: "icon-text" });
  if (iconText && Number.isFinite(iconText.itemSpacing)) {
    tokens["btn/gap"] = pxOf(iconText.itemSpacing);
  }
  const iconOnly = findVariant(document, { variant: "primary", size: "md", content: "icon" });
  const icon = (iconOnly?.children ?? []).find((child) => child.name === "Icon");
  if (icon?.absoluteBoundingBox) {
    tokens["btn/icon"] = pxOf(icon.absoluteBoundingBox.width);
  }
  return { fileKey, nodeId, variants, sizes, tokens };
};

const readFigmaNode = async (fileKey, nodeId, token) => {
  const endpoint = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
  const response = await fetch(endpoint, { headers: { "X-Figma-Token": token } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Figma ${response.status}${body.err ? `: ${body.err}` : ""}`);
  }
  const entry = body.nodes?.[nodeId];
  if (!entry?.document) {
    throw new Error(`Figma node ${nodeId} is missing`);
  }
  return nodeFromDocument(fileKey, nodeId, entry.document);
};

const targetFromArg = (arg) => {
  if (!arg) {
    return null;
  }
  const url = new URL(arg);
  const fileKey = url.pathname.split("/").filter(Boolean)[1];
  const nodeId = url.searchParams.get("node-id")?.replace("-", ":");
  if (!fileKey || !nodeId) {
    throw new Error("URL needs a file key and node-id");
  }
  return { fileKey, nodeId };
};

await loadEnv();
const pasted = targetFromArg(process.argv[2]);
const token = process.env.FIGMA_TOKEN?.trim();
if (!pasted) {
  console.error("compare-node: pass a Figma node URL");
  process.exit(1);
}
if (!token) {
  console.error("compare-node: add FIGMA_TOKEN to .env");
  process.exit(1);
}
const node = await readFigmaNode(pasted.fileKey, pasted.nodeId, token);
console.log(`compare-node: read ${node.nodeId} from Figma`);
const buttonSource = await readFile(buttonPath, "utf8");
const cva = {
  variant: keysIn(buttonSource, "variant"),
  size: keysIn(buttonSource, "size"),
};

for (const variant of cva.variant) {
  allowed.add(`btn/${variant}/bg`);
  allowed.add(`btn/${variant}/fg`);
  allowed.add(`btn/${variant}/hover/bg`);
}
for (const size of cva.size) {
  allowed.add(`btn/height/${size}`);
  allowed.add(`btn/pad-x/${size}`);
  allowed.add(`btn/font-size/${size}`);
}

const unknownKeys = Object.keys(node.tokens).filter((key) => !allowed.has(key));
const unknownVariants = node.variants.filter((variant) => !cva.variant.includes(variant));
const unknownSizes = node.sizes.filter((size) => !cva.size.includes(size));

await rm(outDir, { recursive: true, force: true });

if (unknownKeys.length > 0 || unknownVariants.length > 0 || unknownSizes.length > 0) {
  await writeOut("unmapped.json", {
    ...(unknownKeys.length > 0 ? { keys: unknownKeys } : {}),
    ...(unknownVariants.length > 0 ? { variants: unknownVariants } : {}),
    ...(unknownSizes.length > 0 ? { sizes: unknownSizes } : {}),
  });
  console.error("compare-node: unmapped. See scripts/figma/out/unmapped.json");
  process.exit(2);
}

await syncTokensCss(node.tokens);

const cells = [];
for (const variant of node.variants) {
  for (const size of node.sizes) {
    const pairs = [
      [`btn/${variant}/bg`, "backgroundColor"],
      [`btn/${variant}/fg`, "color"],
      [`btn/height/${size}`, "height"],
      [`btn/pad-x/${size}`, "paddingLeft"],
      [`btn/pad-x/${size}`, "paddingRight"],
      ["btn/pad-y", "paddingTop"],
      ["btn/pad-y", "paddingBottom"],
      ["btn/radius", "borderRadius"],
      [`btn/font-size/${size}`, "fontSize"],
    ].filter(([token]) => token in node.tokens);
    if (variant === "secondary" && "btn/secondary/border" in node.tokens) {
      pairs.push(["btn/secondary/border", "borderTopColor"]);
    }
    if (pairs.length === 0) {
      continue;
    }
    cells.push({
      id: `button/default/${variant}/${size}/text/enabled`,
      state: "rest",
      pairs,
    });
    const hoverKey = `btn/${variant}/hover/bg`;
    if (hoverKey in node.tokens) {
      cells.push({
        id: `button/default/${variant}/${size}/text/enabled`,
        state: "hover",
        pairs: [[hoverKey, "backgroundColor"]],
      });
    }
  }
}
const iconPairs = [
  ["btn/icon", "iconWidth"],
  ["btn/icon", "iconHeight"],
].filter(([token]) => token in node.tokens);
const gapPairs = [["btn/gap", "columnGap"]].filter(([token]) => token in node.tokens);
if (gapPairs.length > 0 || iconPairs.length > 0) {
  cells.push({
    id: "button/default/primary/md/icon-text/enabled",
    state: "rest",
    pairs: [...gapPairs, ...iconPairs],
  });
}
if (iconPairs.length > 0) {
  cells.push({
    id: "button/default/primary/md/icon/enabled",
    state: "rest",
    pairs: iconPairs,
  });
}

const vite = spawn(
  process.execPath,
  [viteBin, "--config", "vite.config.mjs", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
  { cwd: harnessRoot, stdio: "inherit" },
);

const stopVite = () => {
  if (!vite.killed) {
    vite.kill("SIGTERM");
  }
};

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) {
        return;
      }
    } catch {
      await delay(200);
    }
  }
  throw new Error("compare page did not start");
};

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  await page.goto(origin);
  await page.locator("[data-case]").first().waitFor();

  const lines = new Set();
  for (const cell of cells) {
    const row = page.locator(`[data-case="${cell.id}"]`);
    const button = row.locator("[data-impl=tailwind] > *");
    await page.mouse.move(0, 0);
    if (cell.state === "hover") {
      await button.hover();
    }
    const box = await button.evaluate(readBox);
    for (const [token, property] of cell.pairs) {
      const expected = node.tokens[token];
      const actual = box[property];
      if (!differs(expected, actual)) {
        continue;
      }
      lines.add(`${token}: очікувано ${expected} / фактично ${actual}`);
    }
  }

  await browser.close();
  if (lines.size > 0) {
    await writeOut("diff.json", { lines: [...lines] });
    console.error(`compare-node: ${lines.size} rows differ. See scripts/figma/out/diff.json`);
    process.exitCode = 2;
  } else {
    await rm(outDir, { recursive: true, force: true });
    console.log(`compare-node: ${node.nodeId} matches`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopVite();
}
