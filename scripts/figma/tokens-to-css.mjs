import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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

const toVar = (key) => `--${key.replaceAll("/", "-")}`;

const readTokens = (name) =>
  JSON.parse(readFileSync(resolve(root, "tokens", name), "utf8"));

const assertKnown = (tokens, file) => {
  const unknown = Object.keys(tokens).filter((key) => !allowed.has(key));
  if (unknown.length === 0) {
    return;
  }
  console.error(`${file}: unknown keys: ${unknown.join(", ")}`);
  process.exit(1);
};

const block = (selector, tokens) => {
  const lines = Object.entries(tokens)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `  ${toVar(key)}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}\n`;
};

const defaults = readTokens("default.json");
const acme = readTokens("acme.json");
assertKnown(defaults, "tokens/default.json");
assertKnown(acme, "tokens/acme.json");

const kitStyles = resolve(root, "packages/ui/src/styles");
const brandStyles = resolve(root, "web/uk/acme/src/styles/brand.css");
mkdirSync(kitStyles, { recursive: true });
mkdirSync(dirname(brandStyles), { recursive: true });
writeFileSync(resolve(kitStyles, "tokens.css"), block(":root", defaults));
writeFileSync(brandStyles, block('[data-brand="acme"]', acme));
