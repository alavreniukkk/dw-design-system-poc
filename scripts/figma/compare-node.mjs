import { spawn } from "node:child_process";
import { glob, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const outDir = fileURLToPath(new URL("./out/", import.meta.url));
const tokensCssPath = fileURLToPath(
  new URL("../../packages/ui/src/styles/tokens.css", import.meta.url),
);

const knownAxes = new Set(["variant", "size", "state", "content", "align"]);
const knownStates = new Set(["default", "hover", "disabled"]);

const slugOf = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const pascalOf = (name) =>
  name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const keysIn = (source, group) => {
  const start = source.indexOf(`\n      ${group}: {`);
  const end = source.indexOf("\n      },", start);
  if (start < 0 || end < 0) {
    return [];
  }
  return [...source.slice(start, end).matchAll(/\n        (?:"([^"]+)"|([A-Za-z0-9-]+)):/g)].map(
    (match) => match[1] ?? match[2],
  );
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

const declarationsIn = (css) => {
  const map = new Map();
  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    map.set(match[1], match[2].trim());
  }
  return map;
};

const resolveValue = (value, map, seen = new Set()) => {
  const trimmed = value.trim();
  const ref = trimmed.match(/^var\((--[\w-]+)\)$/);
  if (!ref || seen.has(ref[1])) {
    return trimmed;
  }
  const next = map.get(ref[1]);
  if (!next) {
    return trimmed;
  }
  seen.add(ref[1]);
  return resolveValue(next, map, seen);
};

const sameValue = (current, incoming, css) =>
  resolveValue(current, declarationsIn(css)).toLowerCase() === incoming.trim().toLowerCase();

const syncTokensCss = async (tokens) => {
  let text = await readFile(tokensCssPath, "utf8");
  const changed = [];
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value !== "string") {
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
    if (sameValue(match[2], value, text)) {
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
      props[key.toLowerCase()] = value.toLowerCase();
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

const findText = (node) => {
  if (node?.type === "TEXT") {
    return node;
  }
  for (const child of node?.children ?? []) {
    const found = findText(child);
    if (found) {
      return found;
    }
  }
  return null;
};

const borderHex = (node) => {
  const stroke = (node?.strokes ?? []).find((item) => item.type === "SOLID" && item.visible !== false);
  return stroke ? hexOf(stroke.color) : "transparent";
};

const borderWidth = (node) => {
  if (Number.isFinite(node?.strokeWeight) && node.strokeWeight > 0) {
    return pxOf(node.strokeWeight);
  }
  const side = [
    node?.strokeTopWeight,
    node?.strokeRightWeight,
    node?.strokeBottomWeight,
    node?.strokeLeftWeight,
  ].find((value) => Number.isFinite(value) && value > 0);
  return side ? pxOf(side) : null;
};

const radiusOf = (node) => {
  if (Number.isFinite(node?.cornerRadius)) {
    return pxOf(node.cornerRadius);
  }
  const corner = node?.rectangleCornerRadii?.find((value) => Number.isFinite(value));
  return Number.isFinite(corner) ? pxOf(corner) : null;
};

const fontStack = (family) => {
  if (!family) {
    return null;
  }
  if (family.includes("system-ui")) {
    return family;
  }
  return `${family}, system-ui, sans-serif`;
};

const pick = (components, wanted) =>
  components.find((child) => {
    const props = propsOf(child.name);
    return Object.entries(wanted).every(([key, value]) => !value || props[key] === value);
  });

const paintOf = (node) => {
  const label = findText(node);
  return {
    bg: solidHex(node) ?? "transparent",
    fg: solidHex(label),
    border: borderHex(node),
  };
};

const samePaint = (left, right) =>
  left.bg === right.bg && left.fg === right.fg && left.border === right.border;

const nodeFromDocument = (fileKey, nodeId, document) => {
  const components = (document.children ?? []).filter((child) => child.name?.includes("="));
  if (components.length === 0) {
    throw new Error(
      `compare-node: ${document.name ?? nodeId} is not a component set. Pass the set node, not the page.`,
    );
  }
  const axes = {};
  for (const child of components) {
    for (const [key, value] of Object.entries(propsOf(child.name))) {
      (axes[key] ??= new Set()).add(value);
    }
  }
  const list = (key) => [...(axes[key] ?? [])];
  const variants = list("variant");
  const sizes = list("size");
  const contents = list("content");
  const states = list("state");
  const prefix = slugOf(document.name);
  const preferredSize = sizes.includes("medium") ? "medium" : sizes[0];
  const preferredVariant = variants.includes("primary") ? "primary" : variants[0];
  const stateOf = (state) => (states.length > 0 ? state : undefined);
  const tokens = {};
  let sharedDisabled = null;
  let disabledSplits = false;

  for (const variant of variants) {
    const sample = pick(components, {
      variant,
      size: preferredSize,
      state: stateOf("default"),
      content: contents.includes("text") ? "text" : contents[0],
    });
    if (!sample) {
      continue;
    }
    const paint = paintOf(sample);
    tokens[`${prefix}/${variant}/bg`] = paint.bg;
    if (paint.fg) {
      tokens[`${prefix}/${variant}/fg`] = paint.fg;
    }
    tokens[`${prefix}/${variant}/border`] = paint.border;
    const hover = pick(components, {
      variant,
      size: preferredSize,
      state: "hover",
      content: contents.includes("text") ? "text" : contents[0],
    });
    if (hover) {
      const hoverPaint = paintOf(hover);
      if (hoverPaint.bg !== paint.bg) {
        tokens[`${prefix}/${variant}/hover/bg`] = hoverPaint.bg;
      }
      if (hoverPaint.fg && hoverPaint.fg !== paint.fg) {
        tokens[`${prefix}/${variant}/hover/fg`] = hoverPaint.fg;
      }
      if (hoverPaint.border !== paint.border) {
        tokens[`${prefix}/${variant}/hover/border`] = hoverPaint.border;
      }
    }
    const disabled = pick(components, {
      variant,
      size: preferredSize,
      state: "disabled",
      content: contents.includes("text") ? "text" : contents[0],
    });
    if (disabled) {
      const disabledPaint = paintOf(disabled);
      if (!sharedDisabled) {
        sharedDisabled = disabledPaint;
      } else if (!samePaint(sharedDisabled, disabledPaint)) {
        disabledSplits = true;
      }
    }
    const width = borderWidth(sample);
    if (width && !tokens[`${prefix}/border-width`]) {
      tokens[`${prefix}/border-width`] = width;
    }
    const radius = radiusOf(sample);
    if (radius && !tokens[`${prefix}/radius`]) {
      tokens[`${prefix}/radius`] = radius;
    }
    const label = findText(sample);
    const font = fontStack(label?.style?.fontFamily);
    if (font && !tokens[`${prefix}/font`]) {
      tokens[`${prefix}/font`] = font;
    }
  }

  if (sharedDisabled && !disabledSplits) {
    tokens[`${prefix}/disabled/bg`] = sharedDisabled.bg;
    if (sharedDisabled.fg) {
      tokens[`${prefix}/disabled/fg`] = sharedDisabled.fg;
    }
    tokens[`${prefix}/disabled/border`] = sharedDisabled.border;
  }

  for (const size of sizes) {
    const sample = pick(components, {
      variant: preferredVariant,
      size,
      state: stateOf("default"),
      content: contents.includes("text") ? "text" : contents[0],
    });
    if (!sample) {
      continue;
    }
    const label = findText(sample);
    if (sample.absoluteBoundingBox) {
      tokens[`${prefix}/height/${size}`] = pxOf(sample.absoluteBoundingBox.height);
    }
    if (Number.isFinite(sample.paddingLeft)) {
      tokens[`${prefix}/pad-x/${size}`] = pxOf(sample.paddingLeft);
    }
    if (Number.isFinite(sample.paddingTop)) {
      tokens[`${prefix}/pad-y/${size}`] = pxOf(sample.paddingTop);
    }
    if (label?.style?.fontSize) {
      tokens[`${prefix}/font-size/${size}`] = pxOf(label.style.fontSize);
    }
  }

  const iconText = pick(components, {
    variant: preferredVariant,
    size: preferredSize,
    state: stateOf("default"),
    content: "icon-text",
  });
  if (iconText && Number.isFinite(iconText.itemSpacing)) {
    tokens[`${prefix}/gap`] = pxOf(iconText.itemSpacing);
  }
  const iconOnly = pick(components, {
    variant: preferredVariant,
    size: preferredSize,
    state: stateOf("default"),
    content: "icon",
  });
  const icon = (iconOnly?.children ?? []).find((child) => child.name === "Icon");
  if (icon?.absoluteBoundingBox) {
    tokens[`${prefix}/icon`] = pxOf(icon.absoluteBoundingBox.width);
  }
  if (axes.align && !tokens[`${prefix}/gap`]) {
    const spaced = components.find((child) => Number.isFinite(child.itemSpacing));
    if (spaced) {
      tokens[`${prefix}/gap`] = pxOf(spaced.itemSpacing);
    }
  }

  return {
    fileKey,
    nodeId,
    name: document.name,
    slug: prefix,
    variants,
    sizes,
    contents,
    states,
    aligns: list("align"),
    extraAxes: Object.keys(axes).filter((key) => !knownAxes.has(key)),
    disabledSplits,
    tokens,
  };
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

const findComponent = async (name) => {
  const matches = [];
  for await (const entry of glob(`packages/ui/src/components/**/${pascalOf(name)}.tsx`, { cwd: root })) {
    matches.push(entry.split("\\").join("/"));
  }
  return matches;
};

const allowedFor = (prefix, cva) => {
  const keys = new Set([
    `${prefix}/radius`,
    `${prefix}/font`,
    `${prefix}/border-width`,
    `${prefix}/gap`,
    `${prefix}/icon`,
    `${prefix}/disabled/bg`,
    `${prefix}/disabled/fg`,
    `${prefix}/disabled/border`,
  ]);
  for (const variant of cva.variant) {
    for (const part of ["bg", "fg", "border"]) {
      keys.add(`${prefix}/${variant}/${part}`);
      keys.add(`${prefix}/${variant}/hover/${part}`);
    }
  }
  for (const size of cva.size) {
    keys.add(`${prefix}/height/${size}`);
    keys.add(`${prefix}/pad-x/${size}`);
    keys.add(`${prefix}/pad-y/${size}`);
    keys.add(`${prefix}/font-size/${size}`);
  }
  return keys;
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
console.log(`compare-node: read ${node.name} ${node.nodeId} from Figma`);
const files = await findComponent(node.name);
if (files.length > 1) {
  throw new Error(`compare-node: ${node.name} matches ${files.join(", ")}`);
}
const componentFile = files[0] ?? null;
await rm(outDir, { recursive: true, force: true });
await writeOut("component.json", {
  name: node.name,
  slug: node.slug,
  pascal: pascalOf(node.name),
  file: componentFile,
});

const source = componentFile
  ? await readFile(fileURLToPath(new URL(`../../${componentFile}`, import.meta.url)), "utf8")
  : "";
const cva = {
  variant: keysIn(source, "variant"),
  size: keysIn(source, "size"),
  content: keysIn(source, "content"),
  align: keysIn(source, "align"),
};
const allowed = allowedFor(node.slug, cva);
const unknownKeys = componentFile
  ? Object.keys(node.tokens).filter((key) => !allowed.has(key))
  : [];
const unknownVariants = node.variants.filter((variant) => !cva.variant.includes(variant));
const unknownSizes = node.sizes.filter((size) => !cva.size.includes(size));
const unknownContents = node.contents.filter((content) => !cva.content.includes(content));
const unknownStates = node.states.filter((state) => !knownStates.has(state));
const unknownAligns = node.aligns.filter((align) => !cva.align.includes(align));

if (
  !componentFile ||
  unknownKeys.length > 0 ||
  unknownVariants.length > 0 ||
  unknownSizes.length > 0 ||
  unknownContents.length > 0 ||
  unknownStates.length > 0 ||
  unknownAligns.length > 0 ||
  node.extraAxes.length > 0 ||
  node.disabledSplits
) {
  await writeOut("unmapped.json", {
    ...(!componentFile ? { missing: true } : {}),
    ...(unknownKeys.length > 0 ? { keys: unknownKeys } : {}),
    ...(unknownVariants.length > 0 ? { variants: unknownVariants } : {}),
    ...(unknownSizes.length > 0 ? { sizes: unknownSizes } : {}),
    ...(unknownContents.length > 0 ? { contents: unknownContents } : {}),
    ...(unknownStates.length > 0 ? { states: unknownStates } : {}),
    ...(unknownAligns.length > 0 ? { aligns: unknownAligns } : {}),
    ...(node.extraAxes.length > 0 ? { axes: node.extraAxes } : {}),
    ...(node.disabledSplits ? { disabled: "per-variant" } : {}),
  });
  console.error("compare-node: unmapped. See scripts/figma/out/unmapped.json");
  process.exit(2);
}

await syncTokensCss(node.tokens);
console.log(`compare-node: ${node.name} mapped`);
