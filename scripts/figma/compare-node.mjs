import { spawn } from "node:child_process";
import { glob, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// One Figma component set against the React file of the same name.
// Colors and sizes come from tokens.css and from classes already used in packages/ui.
// One matching token is rewritten in the component. A literal token used only by this
// file can change value. A shared token never receives a new hex. Anything else is
// out/unmapped.json for sync-node.

const root = fileURLToPath(new URL("../..", import.meta.url));
const outDir = fileURLToPath(new URL("./out/", import.meta.url));
const tokensCssPath = fileURLToPath(
  new URL("../../packages/ui/src/styles/tokens.css", import.meta.url),
);
const themeCssPath = fileURLToPath(new URL("../../packages/ui/src/styles/theme.css", import.meta.url));

const stateAxis = "state";
const knownStates = new Set(["default", "hover", "disabled"]);
const lengthUtilities = new Set(["rounded", "h", "w", "size", "px", "py", "p", "gap", "text"]);

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

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sameList = (left, right) => left.length === right.length && left.every((item, i) => item === right[i]);

const pxNum = (value) => {
  if (typeof value !== "string") return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
};

const sameLength = (left, right) => {
  const a = pxNum(left);
  const b = pxNum(right);
  return a != null && b != null && Math.abs(a - b) <= 1;
};

const normHex = (value) => {
  const hex = value.trim().toUpperCase();
  return hex.length === 9 && hex.endsWith("FF") ? hex.slice(0, 7) : hex;
};

const sameColor = (left, right) => {
  if (!left || !right) return false;
  if (left === "transparent" || right === "transparent") return left === right;
  if (!left.startsWith("#") || !right.startsWith("#")) return false;
  return normHex(left) === normHex(right);
};

const isColor = (value) => value === "transparent" || (typeof value === "string" && value.startsWith("#"));

const themeGroup = (utility) => {
  if (utility === "rounded") return "radius";
  if (utility === "text") return "text";
  if (["px", "py", "p", "gap", "h", "w", "size"].includes(utility)) return "spacing";
  return null;
};

const roleOf = (utility, kind) => {
  if (utility === "bg") return "bg";
  if (utility === "text") return kind === "color" ? "fg" : "fontSize";
  if (utility === "border") return kind === "color" ? "border" : "borderWidth";
  if (utility === "rounded") return "radius";
  if (utility === "h") return "height";
  if (utility === "w") return "width";
  if (utility === "size") return "size";
  if (utility === "px") return "padX";
  if (utility === "py") return "padY";
  if (utility === "p") return "pad";
  if (utility === "gap") return "gap";
  return utility;
};

const nameFits = (utility, tokenName) => {
  if (utility === "bg") return tokenName.includes("-bg-");
  if (utility === "text") return tokenName.includes("-fg-") || tokenName.includes("-text-");
  if (utility === "border") return tokenName.includes("-border-");
  if (utility === "rounded") return tokenName.includes("-radius-");
  if (utility === "h" || utility === "w" || utility === "size") return tokenName.includes("-size-");
  if (utility === "px" || utility === "py" || utility === "p" || utility === "gap") {
    return tokenName.includes("-space-");
  }
  return true;
};

const matchBrace = (source, openIndex) => {
  const open = source[openIndex];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (quote === "`" && ch === "$" && source[i + 1] === "{") {
        const inner = matchBrace(source, i + 1);
        if (inner < 0) return -1;
        i = inner;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
};

const skipTrivia = (source, index) => {
  let i = index;
  while (i < source.length) {
    if (/\s/.test(source[i]) || source[i] === ",") {
      i += 1;
      continue;
    }
    if (source.startsWith("//", i)) {
      const nl = source.indexOf("\n", i);
      i = nl < 0 ? source.length : nl + 1;
      continue;
    }
    if (source.startsWith("/*", i)) {
      const end = source.indexOf("*/", i + 2);
      i = end < 0 ? source.length : end + 2;
      continue;
    }
    break;
  }
  return i;
};

const parseLiteral = (source, index) => {
  const quote = source[index];
  let value = "";
  for (let i = index + 1; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "\\") {
      value += source[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (quote === "`" && ch === "$" && source[i + 1] === "{") {
      const inner = matchBrace(source, i + 1);
      if (inner < 0) break;
      value += " ";
      i = inner;
      continue;
    }
    if (ch === quote) return { value, start: index + 1, end: i };
    value += ch;
  }
  throw new Error("compare-node: unterminated string");
};

const parseFields = (source, openBrace) => {
  const end = matchBrace(source, openBrace);
  if (end < 0) throw new Error("compare-node: unterminated object");
  const fields = [];
  let i = openBrace + 1;
  while (i < end) {
    i = skipTrivia(source, i);
    if (i >= end) break;
    let key = "";
    if (source[i] === '"' || source[i] === "'") {
      const lit = parseLiteral(source, i);
      key = lit.value;
      i = lit.end + 1;
    } else {
      const matched = /^[A-Za-z0-9_]+/.exec(source.slice(i));
      if (!matched) break;
      key = matched[0];
      i += key.length;
    }
    i = skipTrivia(source, i);
    if (source[i] !== ":") break;
    i = skipTrivia(source, i + 1);
    if (source[i] === '"' || source[i] === "'" || source[i] === "`") {
      const literal = parseLiteral(source, i);
      fields.push({ key, literal });
      i = literal.end + 1;
    } else if (source[i] === "{" || source[i] === "[") {
      const close = matchBrace(source, i);
      if (close < 0) throw new Error("compare-node: unterminated object");
      fields.push({ key, blockStart: i, blockEnd: close });
      i = close + 1;
    } else {
      break;
    }
  }
  return { end, fields };
};

const partFrom = (literal) => ({ text: literal.value, start: literal.start, end: literal.end });

const parseCompounds = (source, openBracket) => {
  const end = matchBrace(source, openBracket);
  const compounds = [];
  let i = openBracket + 1;
  while (i < end) {
    if (source[i] !== "{") {
      i += 1;
      continue;
    }
    const parsed = parseFields(source, i);
    const when = {};
    let classLit = null;
    for (const field of parsed.fields) {
      if ((field.key === "class" || field.key === "className") && field.literal) classLit = field.literal;
      else if (field.literal) when[field.key] = field.literal.value;
    }
    if (classLit) compounds.push({ when, ...partFrom(classLit) });
    i = parsed.end + 1;
  }
  return compounds;
};

const parseCva = (source) => {
  const empty = { base: null, variants: {}, compounds: [], defaults: {} };
  const at = source.indexOf("cva(");
  if (at < 0) return empty;
  let i = skipTrivia(source, at + 4);
  let base = null;
  if (source[i] === '"' || source[i] === "'" || source[i] === "`") {
    const literal = parseLiteral(source, i);
    base = partFrom(literal);
    i = skipTrivia(source, literal.end + 1);
    if (source[i] === ",") i = skipTrivia(source, i + 1);
  }
  if (source[i] !== "{") return { ...empty, base };
  const config = parseFields(source, i);
  const variants = {};
  let compounds = [];
  const defaults = {};
  for (const field of config.fields) {
    if (field.key === "variants" && field.blockStart != null && source[field.blockStart] === "{") {
      for (const axis of parseFields(source, field.blockStart).fields) {
        if (axis.blockStart == null || source[axis.blockStart] !== "{") continue;
        variants[axis.key] = {};
        for (const branch of parseFields(source, axis.blockStart).fields) {
          if (branch.literal) variants[axis.key][branch.key] = partFrom(branch.literal);
        }
      }
    }
    if (field.key === "compoundVariants" && field.blockStart != null && source[field.blockStart] === "[") {
      compounds = parseCompounds(source, field.blockStart);
    }
    if (field.key === "defaultVariants" && field.blockStart != null && source[field.blockStart] === "{") {
      for (const item of parseFields(source, field.blockStart).fields) {
        if (item.literal) defaults[item.key] = item.literal.value;
      }
    }
  }
  return { base, variants, compounds, defaults };
};

const propsIn = (source) => {
  const names = new Set();
  const matched = /=\s*\(\s*\{([^}]*)\}/.exec(source);
  if (!matched) return names;
  for (const part of matched[1].split(",")) {
    const name = /^\s*([A-Za-z0-9_]+)/.exec(part);
    if (name) names.add(name[1]);
  }
  return names;
};

const classesFor = (cva, props) => {
  const chosen = { ...cva.defaults };
  for (const [axis, value] of Object.entries(props)) {
    if (axis === stateAxis) continue;
    if (cva.variants[axis]?.[value]) chosen[axis] = value;
  }
  const parts = [];
  if (cva.base) parts.push(cva.base);
  for (const [axis, value] of Object.entries(chosen)) {
    const branch = cva.variants[axis]?.[value];
    if (branch) parts.push(branch);
  }
  for (const compound of cva.compounds) {
    const ok = Object.entries(compound.when).every(([key, value]) => chosen[key] === value);
    if (ok) parts.push(compound);
  }
  return { chosen, parts };
};

const splitAtom = (atom) => {
  const prefixes = [];
  let rest = atom;
  while (true) {
    const cut = rest.indexOf(":");
    if (cut <= 0) break;
    const prefix = rest.slice(0, cut);
    if (!/^[\w-]+$/.test(prefix)) break;
    prefixes.push(prefix);
    rest = rest.slice(cut + 1);
  }
  return { prefixes, rest };
};

const classify = (rest, tokens, theme) => {
  if (rest === "border") {
    return {
      role: "borderWidth",
      utility: "border",
      body: "border",
      resolved: theme.borderWidth,
      kind: "length",
    };
  }
  const tokenForm = /^(bg|text|border|rounded|h|w|size|px|py|p|gap)-\(--([\w-]+)\)$/.exec(rest);
  if (tokenForm) {
    const utility = tokenForm[1];
    const token = `--${tokenForm[2]}`;
    const resolved = tokens.resolve(token);
    const kind = isColor(resolved) ? "color" : "length";
    return { role: roleOf(utility, kind), utility, body: rest, resolved, token, kind };
  }
  const stepForm = /^(bg|text|border|rounded|h|w|size|px|py|p|gap)-([A-Za-z0-9]+)$/.exec(rest);
  if (!stepForm) return null;
  const utility = stepForm[1];
  const step = stepForm[2];
  if (step === "transparent") {
    return { role: roleOf(utility, "color"), utility, body: rest, resolved: "transparent", kind: "color" };
  }
  const group = themeGroup(utility);
  const resolved = group ? theme[group].get(step) : null;
  if (!resolved || !lengthUtilities.has(utility)) return null;
  return { role: roleOf(utility, "length"), utility, body: rest, resolved, step, kind: "length" };
};

const refsIn = (text, tokens, theme) => {
  const refs = [];
  for (const atom of text.split(/\s+/)) {
    if (!atom) continue;
    const { prefixes, rest } = splitAtom(atom);
    if (prefixes.some((prefix) => prefix !== "hover" && prefix !== "disabled")) continue;
    const ref = classify(rest, tokens, theme);
    if (!ref) continue;
    refs.push({ ...ref, prefixes, atom });
  }
  return refs;
};

const activeRefs = (parts, state, tokens, theme) => {
  const all = [];
  for (const part of parts) {
    for (const ref of refsIn(part.text, tokens, theme)) all.push({ ...ref, part });
  }
  const want = state === "hover" ? ["hover"] : state === "disabled" ? ["disabled"] : [];
  const chosen = [];
  for (const role of new Set(all.map((ref) => ref.role))) {
    const group = all.filter((ref) => ref.role === role);
    const bases = group.filter((ref) => ref.prefixes.length === 0);
    if (want.length === 0) {
      if (bases.length) chosen.push(bases.at(-1));
      continue;
    }
    const exact = group.filter((ref) => sameList(ref.prefixes, want));
    if (exact.length) chosen.push(exact.at(-1));
    else if (bases.length) chosen.push({ ...bases.at(-1), inherited: true });
  }
  return chosen;
};

const parseTokens = (css) => {
  const entries = [];
  let layer = "unknown";
  for (const line of css.split("\n")) {
    const comment = /\/\*\s*([^*]+?)\s*\*\//.exec(line);
    if (comment && !line.includes("--")) layer = comment[1].trim().toLowerCase();
    const decl = /(--[\w-]+)\s*:\s*([^;]+);/.exec(line);
    if (decl) entries.push({ name: decl[1], raw: decl[2].trim(), layer });
  }
  const map = new Map(entries.map((entry) => [entry.name, entry]));
  const resolve = (name, seen = new Set()) => {
    const entry = map.get(name);
    if (!entry) return null;
    const ref = /^var\((--[\w-]+)\)$/.exec(entry.raw);
    if (!ref || seen.has(name)) return entry.raw;
    seen.add(name);
    return resolve(ref[1], seen) ?? entry.raw;
  };
  return { entries, map, resolve };
};

const resolveRaw = (raw, tokens) => {
  const ref = /^var\((--[\w-]+)\)$/.exec(raw.trim());
  return ref ? tokens.resolve(ref[1]) : raw.trim();
};

const parseTheme = (css, tokens) => {
  const spacing = new Map();
  const radius = new Map();
  const text = new Map();
  let borderWidth = null;
  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const name = match[1];
    const resolved = resolveRaw(match[2], tokens);
    if (name.startsWith("--spacing-")) spacing.set(name.slice("--spacing-".length), resolved);
    else if (name.startsWith("--radius-")) radius.set(name.slice("--radius-".length), resolved);
    else if (name.startsWith("--text-")) text.set(name.slice("--text-".length), resolved);
    else if (name === "--default-border-width") borderWidth = resolved;
  }
  return { spacing, radius, text, borderWidth };
};

const indexUsages = (source) => {
  const usages = new Map();
  for (const match of source.matchAll(/(?:[\w-]+:)*(bg|text|border|rounded|h|w|size|px|py|p|gap)-\(--([\w-]+)\)/g)) {
    const utility = match[1];
    const token = `--${match[2]}`;
    if (!usages.has(utility)) usages.set(utility, new Set());
    usages.get(utility).add(token);
  }
  return usages;
};

const matches = (ref, value) =>
  ref.kind === "color" || isColor(value) ? sameColor(ref.resolved, value) : sameLength(ref.resolved, value);

const poolFor = (utility, value, tokens, usages) => {
  const color = isColor(value);
  const same = color
    ? (token) => sameColor(tokens.resolve(token), value)
    : (token) => sameLength(tokens.resolve(token), value);
  const used = [...(usages.get(utility) ?? [])].filter(same);
  if (used.length) return used.map((token) => `${utility}-(${token})`);
  if (value === "transparent") return [`${utility}-transparent`];
  let entries = tokens.entries.filter((entry) => same(entry.name));
  const semantic = entries.filter((entry) => entry.layer === "semantic");
  if (semantic.length) entries = semantic;
  else entries = entries.filter((entry) => entry.layer !== "primitive");
  const named = entries.filter((entry) => nameFits(utility, entry.name));
  const chosen = named.length ? named : entries;
  return chosen.map((entry) => `${utility}-(${entry.name})`);
};

const stepAtoms = (utility, value, theme) => {
  const group = themeGroup(utility);
  if (!group) return [];
  const found = [];
  for (const [step, resolved] of theme[group]) {
    if (sameLength(resolved, value)) found.push(`${utility}-${step}`);
  }
  return found;
};

const optionsFor = (ref, value, tokens, theme, usages) => {
  if (value == null) return [];
  const steps = ref.kind === "length" ? stepAtoms(ref.utility, value, theme) : [];
  const tokensAtoms = value === "transparent" ? [`${ref.utility}-transparent`] : poolFor(ref.utility, value, tokens, usages);
  let options = ref.token ? tokensAtoms : ref.step ? steps : [...steps, ...tokensAtoms];
  if (ref.token && options.length === 0) options = tokensAtoms;
  return [...new Set(options)].filter((atom) => atom !== ref.atom);
};

const valueFor = (ref, node) => {
  if (ref.role === "bg") return node.bg;
  if (ref.role === "fg") return node.fg;
  if (ref.role === "border") return node.border;
  if (ref.role === "borderWidth") return node.border === "transparent" ? null : node.borderWidth;
  if (ref.role === "radius") return node.radius;
  if (ref.role === "height") return node.height;
  if (ref.role === "width") return node.width;
  if (ref.role === "fontSize") return node.fontSize;
  if (ref.role === "gap") return node.gap;
  if (ref.role === "padX") return node.padX;
  if (ref.role === "padY") return node.padY;
  return null;
};

const literalOwnedByFile = (token, tokens, tokensCss, tsxFiles, filePath) => {
  const entry = tokens.map.get(token);
  if (!entry || entry.raw.startsWith("var(")) return false;
  if (tokensCss.split(token).length - 1 !== 1) return false;
  const owners = tsxFiles.filter((file) => file.source.includes(token));
  return owners.length === 1 && owners[0].path === filePath;
};

const reportOf = (ref, props, state, figma, options) => ({
  props,
  state,
  role: ref.role,
  figma,
  code: ref.atom,
  resolved: ref.resolved,
  candidates: options,
});

const assessRef = (ref, node, props, state, ctx) => {
  if (ref.role === "size") {
    const heightOk = node.height == null || sameLength(ref.resolved, node.height);
    const widthOk = node.width == null || sameLength(ref.resolved, node.width);
    if (heightOk && widthOk) return;
    if (heightOk && !widthOk) {
      ctx.drift.push(reportOf(ref, props, state, node.width, []));
      return;
    }
  }
  if (ref.role === "pad") {
    const xOk = node.padX == null || sameLength(ref.resolved, node.padX);
    const yOk = node.padY == null || sameLength(ref.resolved, node.padY);
    if (xOk && yOk) return;
    if (node.padX != null && node.padY != null && !sameLength(node.padX, node.padY)) {
      ctx.drift.push(reportOf(ref, props, state, `${node.padX}/${node.padY}`, []));
      return;
    }
  }
  const figma = ref.role === "size" ? node.height : ref.role === "pad" ? node.padX : valueFor(ref, node);
  if (figma == null) return;
  if (ref.role !== "size" && ref.role !== "pad" && matches(ref, figma)) return;
  const options = optionsFor(ref, figma, ctx.tokens, ctx.theme, ctx.usages);
  if (!ref.inherited && options.length === 1) {
    ctx.sourceFixes.push({
      start: ref.part.start,
      end: ref.part.end,
      from: ref.atom,
      to: options[0],
      report: reportOf(ref, props, state, figma, options),
    });
    return;
  }
  if (
    !ref.inherited &&
    ref.token &&
    options.length === 0 &&
    literalOwnedByFile(ref.token, ctx.tokens, ctx.tokensCss, ctx.tsxFiles, ctx.filePath)
  ) {
    ctx.tokenFixes.push({ name: ref.token, value: figma });
    return;
  }
  ctx.drift.push(reportOf(ref, props, state, figma, options));
};

const classSuggestions = (measure, tokens, theme, usages) => {
  const suggestions = {};
  const roles = [
    ["bg", "bg", measure.bg],
    ["fg", "text", measure.fg],
    ["border", "border", measure.border],
    ["radius", "rounded", measure.radius],
    ["height", "h", measure.height],
    ["padX", "px", measure.padX],
    ["padY", "py", measure.padY],
    ["fontSize", "text", measure.fontSize],
    ["gap", "gap", measure.gap],
  ];
  for (const [role, utility, value] of roles) {
    if (value == null || value === "transparent") continue;
    const fake = { utility, kind: isColor(value) ? "color" : "length", atom: "" };
    const options = optionsFor(fake, value, tokens, theme, usages);
    if (options.length) suggestions[role] = options;
  }
  return suggestions;
};

const propsOf = (name) => {
  const props = {};
  for (const part of name.split(", ")) {
    const [key, value] = part.split("=");
    if (value) props[key.toLowerCase()] = value.toLowerCase();
  }
  return props;
};

const hexOf = (color) => {
  const channel = (value) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  const rgb = `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
  if (color.a != null && color.a < 1) return `${rgb}${channel(color.a)}`;
  return rgb;
};

const solidHex = (node) => {
  const paint = (node?.fills ?? []).find((item) => item.type === "SOLID" && item.visible !== false);
  return paint ? hexOf(paint.color) : null;
};

const pxOf = (value) => `${Math.round(value)}px`;

const findText = (node) => {
  if (node?.type === "TEXT") return node;
  for (const child of node?.children ?? []) {
    const found = findText(child);
    if (found) return found;
  }
  return null;
};

const borderHex = (node) => {
  const stroke = (node?.strokes ?? []).find((item) => item.type === "SOLID" && item.visible !== false);
  return stroke ? hexOf(stroke.color) : "transparent";
};

const borderWidth = (node) => {
  if (Number.isFinite(node?.strokeWeight) && node.strokeWeight > 0) return pxOf(node.strokeWeight);
  const side = [node?.strokeTopWeight, node?.strokeRightWeight, node?.strokeBottomWeight, node?.strokeLeftWeight].find(
    (value) => Number.isFinite(value) && value > 0,
  );
  return side ? pxOf(side) : null;
};

const radiusOf = (node) => {
  if (Number.isFinite(node?.cornerRadius)) return pxOf(node.cornerRadius);
  const corner = node?.rectangleCornerRadii?.find((value) => Number.isFinite(value));
  return Number.isFinite(corner) ? pxOf(corner) : null;
};

const measureNode = (node) => {
  const label = findText(node);
  return {
    bg: solidHex(node) ?? "transparent",
    fg: solidHex(label),
    border: borderHex(node),
    borderWidth: borderWidth(node),
    radius: radiusOf(node),
    height: node.absoluteBoundingBox ? pxOf(node.absoluteBoundingBox.height) : null,
    width: node.absoluteBoundingBox ? pxOf(node.absoluteBoundingBox.width) : null,
    padX: Number.isFinite(node.paddingLeft) ? pxOf(node.paddingLeft) : null,
    padY: Number.isFinite(node.paddingTop) ? pxOf(node.paddingTop) : null,
    fontSize: label?.style?.fontSize ? pxOf(label.style.fontSize) : null,
    gap: Number.isFinite(node.itemSpacing) ? pxOf(node.itemSpacing) : null,
  };
};

const variantNodes = (document) => {
  const children = (document.children ?? []).filter((child) => child.name?.includes("="));
  if (children.length === 0) {
    throw new Error(
      `compare-node: ${document.name ?? "node"} is not a component set. Pass the set node, not the page.`,
    );
  }
  return children;
};

const compareModel = ({ source, document, tokensCss, themeCss, tsxFiles, filePath }) => {
  const tokens = parseTokens(tokensCss);
  const theme = parseTheme(themeCss, tokens);
  const usages = indexUsages(tsxFiles.map((file) => file.source).join("\n"));
  const cva = parseCva(source);
  const declared = propsIn(source);
  const children = variantNodes(document);
  const axes = {};
  const values = {};
  const states = new Set();
  const drift = [];
  const sourceFixes = [];
  const tokenFixes = [];
  const samples = [];
  const ctx = { tokens, theme, usages, tokensCss, tsxFiles, filePath, drift, sourceFixes, tokenFixes };

  for (const child of children) {
    for (const [axis, value] of Object.entries(propsOf(child.name))) {
      if (axis === stateAxis) {
        if (!knownStates.has(value)) states.add(value);
        continue;
      }
      (axes[axis] ??= new Set()).add(value);
    }
  }

  const missing = source.trim().length === 0;
  if (!missing) {
    for (const [axis, set] of Object.entries(axes)) {
      if (cva.variants[axis]) {
        const absent = [...set].filter((value) => !cva.variants[axis][value]);
        if (absent.length) values[axis] = absent;
      } else if (!declared.has(axis)) {
        axes[axis] = set;
      } else {
        delete axes[axis];
      }
    }
    for (const axis of Object.keys(axes)) {
      if (cva.variants[axis]) delete axes[axis];
    }
  }

  for (const child of children) {
    const props = propsOf(child.name);
    const state = props[stateAxis] ?? "default";
    const measure = measureNode(child);
    const blocked = Object.entries(props).some(([axis, value]) => {
      if (axis === stateAxis) return !knownStates.has(value);
      if (!cva.variants[axis]) return true;
      return !cva.variants[axis][value];
    });
    if (missing || blocked) {
      if (samples.length < 24) {
        samples.push({ props, state, classes: classSuggestions(measure, tokens, theme, usages) });
      }
      continue;
    }
    const { parts } = classesFor(cva, props);
    for (const ref of activeRefs(parts, state, tokens, theme)) {
      assessRef(ref, measure, props, state, ctx);
    }
  }

  const issues = {};
  if (missing) issues.missing = true;
  if (!missing && Object.keys(axes).length) {
    issues.axes = Object.fromEntries([...Object.entries(axes)].map(([key, set]) => [key, [...set]]));
  }
  if (Object.keys(values).length) issues.values = values;
  if (states.size) issues.states = [...states];
  if (drift.length) issues.drift = drift;
  if (samples.length && (missing || Object.keys(values).length)) issues.samples = samples;
  const sourceByKey = new Map();
  for (const fix of sourceFixes) {
    const key = `${fix.start}:${fix.from}`;
    const prev = sourceByKey.get(key);
    if (!prev) sourceByKey.set(key, fix);
    else if (prev.to !== fix.to) prev.conflict = true;
  }
  const uniqueSourceFixes = [];
  for (const fix of sourceByKey.values()) {
    if (fix.conflict) drift.push(fix.report);
    else uniqueSourceFixes.push(fix);
  }
  const tokenByName = new Map();
  for (const fix of tokenFixes) {
    const prev = tokenByName.get(fix.name);
    if (!prev) tokenByName.set(fix.name, fix);
    else if (prev.value !== fix.value) prev.conflict = true;
  }
  const uniqueTokenFixes = [];
  for (const fix of tokenByName.values()) {
    if (!fix.conflict) uniqueTokenFixes.push(fix);
  }
  if (drift.length) issues.drift = drift;
  return { issues, sourceFixes: uniqueSourceFixes, tokenFixes: uniqueTokenFixes };
};

const applySourceFixes = (source, fixes) => {
  const groups = new Map();
  for (const fix of fixes) {
    const key = `${fix.start}:${fix.end}`;
    const list = groups.get(key) ?? [];
    list.push(fix);
    groups.set(key, list);
  }
  const ordered = [...groups.values()].sort((a, b) => b[0].start - a[0].start);
  let next = source;
  for (const list of ordered) {
    const { start, end } = list[0];
    let slice = next.slice(start, end);
    for (const fix of list) {
      if (slice.includes(fix.from)) slice = slice.replace(fix.from, fix.to);
    }
    next = next.slice(0, start) + slice + next.slice(end);
  }
  return next;
};

const applyTokenFixes = (css, fixes) => {
  let next = css;
  for (const fix of fixes) {
    const pattern = new RegExp(`(${escapeRegExp(fix.name)}\\s*:\\s*)([^;]+)(;)`);
    next = next.replace(pattern, `$1${fix.value}$3`);
  }
  return next;
};

const loadEnv = async () => {
  const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
  let text = "";
  try {
    text = await readFile(envPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const splitAt = trimmed.indexOf("=");
    const key = trimmed.slice(0, splitAt).trim();
    let value = trimmed.slice(splitAt + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
};

const targetFromArg = (arg) => {
  if (!arg) return null;
  const url = new URL(arg);
  const parts = url.pathname.split("/").filter(Boolean);
  let fileKey = parts[1];
  const branchAt = parts.indexOf("branch");
  if (branchAt >= 0 && parts[branchAt + 1]) fileKey = parts[branchAt + 1];
  const nodeId = url.searchParams.get("node-id")?.replaceAll("-", ":");
  if (!fileKey || !nodeId) throw new Error("URL needs a file key and node-id");
  return { fileKey, nodeId };
};

const readFigmaNode = async (fileKey, nodeId, token) => {
  const endpoint = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
  const response = await fetch(endpoint, { headers: { "X-Figma-Token": token } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Figma ${response.status}${body.err ? `: ${body.err}` : ""}`);
  const entry = body.nodes?.[nodeId];
  if (!entry?.document) throw new Error(`Figma node ${nodeId} is missing`);
  return entry.document;
};

const findComponent = async (name) => {
  const matches = new Set();
  for await (const entry of glob(`packages/ui/src/components/**/${pascalOf(name)}.tsx`, { cwd: root })) {
    const rel = entry.split("\\").join("/");
    const abs = fileURLToPath(new URL(`../../${rel}`, import.meta.url));
    matches.add(relative(root, await realpath(abs)).split("\\").join("/"));
  }
  return [...matches];
};

const componentSources = async () => {
  const files = [];
  for await (const entry of glob("packages/ui/src/components/**/*.tsx", { cwd: root })) {
    const path = entry.split("\\").join("/");
    if (path.endsWith(".test.tsx") || path.endsWith(".stories.tsx")) continue;
    const source = await readFile(fileURLToPath(new URL(`../../${path}`, import.meta.url)), "utf8");
    files.push({ path, source });
  }
  return files;
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

const pruneIssues = (issues) => {
  const next = {};
  for (const [key, value] of Object.entries(issues)) {
    if (value == null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) continue;
    next[key] = value;
  }
  return next;
};

const hasIssues = (issues) => Object.keys(pruneIssues(issues)).length > 0;

const main = async () => {
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
  const document = await readFigmaNode(pasted.fileKey, pasted.nodeId, token);
  console.log(`compare-node: read ${document.name} ${pasted.nodeId} from Figma`);
  const files = await findComponent(document.name);
  if (files.length > 1) throw new Error(`compare-node: ${document.name} matches ${files.join(", ")}`);
  const componentFile = files[0] ?? null;
  await rm(outDir, { recursive: true, force: true });
  await writeOut("component.json", {
    name: document.name,
    slug: slugOf(document.name),
    pascal: pascalOf(document.name),
    file: componentFile,
  });

  const tsxFiles = await componentSources();
  const source = componentFile
    ? await readFile(fileURLToPath(new URL(`../../${componentFile}`, import.meta.url)), "utf8")
    : "";
  const readCss = async () => ({
    tokensCss: await readFile(tokensCssPath, "utf8"),
    themeCss: await readFile(themeCssPath, "utf8"),
  });
  let css = await readCss();
  let currentSource = source;
  let result = compareModel({
    source: currentSource,
    document,
    tokensCss: css.tokensCss,
    themeCss: css.themeCss,
    tsxFiles,
    filePath: componentFile,
  });

  for (let pass = 0; pass < 5; pass += 1) {
    if (!componentFile || (!result.sourceFixes.length && !result.tokenFixes.length)) {
      break;
    }
    if (result.sourceFixes.length) {
      currentSource = applySourceFixes(currentSource, result.sourceFixes);
      await writeFile(fileURLToPath(new URL(`../../${componentFile}`, import.meta.url)), currentSource);
      const owner = tsxFiles.find((file) => file.path === componentFile);
      if (owner) owner.source = currentSource;
      console.log(`compare-node: retargeted ${result.sourceFixes.length} classes in ${componentFile}`);
    }
    if (result.tokenFixes.length) {
      const nextCss = applyTokenFixes(css.tokensCss, result.tokenFixes);
      await writeFile(tokensCssPath, nextCss.endsWith("\n") ? nextCss : `${nextCss}\n`);
      css.tokensCss = nextCss.endsWith("\n") ? nextCss : `${nextCss}\n`;
      await run("npm", ["run", "build", "-w", "@dw/ui"]);
      console.log(`compare-node: updated ${result.tokenFixes.map((fix) => fix.name).join(", ")}`);
    }
    css = await readCss();
    currentSource = await readFile(fileURLToPath(new URL(`../../${componentFile}`, import.meta.url)), "utf8");
    result = compareModel({
      source: currentSource,
      document,
      tokensCss: css.tokensCss,
      themeCss: css.themeCss,
      tsxFiles,
      filePath: componentFile,
    });
  }

  if (result.sourceFixes.length || result.tokenFixes.length) {
    const drift = [...(result.issues.drift ?? [])];
    for (const fix of result.sourceFixes) {
      if (fix.report) drift.push(fix.report);
    }
    for (const fix of result.tokenFixes) {
      drift.push({ kind: "token", name: fix.name, figma: fix.value });
    }
    if (drift.length) result.issues.drift = drift;
  }
  result.issues = pruneIssues(result.issues);

  if (hasIssues(result.issues)) {
    await writeOut("unmapped.json", result.issues);
    console.error("compare-node: unmapped. See scripts/figma/out/unmapped.json");
    process.exit(2);
  }
  console.log(`compare-node: ${document.name} mapped`);
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

export {
  applySourceFixes,
  applyTokenFixes,
  classesFor,
  compareModel,
  hasIssues,
  indexUsages,
  parseCva,
  parseTheme,
  parseTokens,
  pruneIssues,
  propsOf,
  targetFromArg,
};
