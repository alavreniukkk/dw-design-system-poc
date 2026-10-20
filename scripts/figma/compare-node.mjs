import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const outDir = fileURLToPath(new URL("./out/", import.meta.url));
const buttonPath = fileURLToPath(
  new URL("../../packages/ui/src/components/atoms/button/Button.tsx", import.meta.url),
);
const tokensCssPath = fileURLToPath(
  new URL("../../packages/ui/src/styles/tokens.css", import.meta.url),
);

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
console.log(`compare-node: ${node.nodeId} mapped`);
