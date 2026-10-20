import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { setTimeout as delay } from "node:timers/promises";

const port = 4178;
const origin = `http://127.0.0.1:${port}`;
const outDir = fileURLToPath(new URL("./out/", import.meta.url));
const harnessRoot = fileURLToPath(new URL("./", import.meta.url));

await rm(outDir, { recursive: true, force: true });

const vite = spawn(
  "vite",
  ["--config", "vite.config.mjs", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
  { cwd: harnessRoot, stdio: "inherit" },
);

const stopVite = () => {
  if (!vite.killed) {
    vite.kill("SIGTERM");
  }
};

const readBox = (node) => {
  const style = getComputedStyle(node);
  const box = node.getBoundingClientRect();
  const icon = node.querySelector("svg");
  const iconBox = icon ? icon.getBoundingClientRect() : null;
  return {
    backgroundColor: style.backgroundColor,
    color: style.color,
    borderTopColor: style.borderTopColor,
    borderRightColor: style.borderRightColor,
    borderBottomColor: style.borderBottomColor,
    borderLeftColor: style.borderLeftColor,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    opacity: style.opacity,
    width: box.width,
    height: box.height,
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    borderTopWidth: style.borderTopWidth,
    borderRightWidth: style.borderRightWidth,
    borderBottomWidth: style.borderBottomWidth,
    borderLeftWidth: style.borderLeftWidth,
    borderRadius: style.borderRadius,
    columnGap: style.columnGap,
    rowGap: style.rowGap,
    icon: iconBox
      ? {
          x: iconBox.x - box.x,
          y: iconBox.y - box.y,
          width: iconBox.width,
          height: iconBox.height,
        }
      : null,
  };
};

const paintKeys = [
  "backgroundColor",
  "color",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "fontFamily",
  "fontSize",
  "opacity",
];

const layoutKeys = [
  "width",
  "height",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRadius",
  "columnGap",
  "rowGap",
];

const colorOf = (value) => {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    return value;
  }
  const parts = match[1].split(",").map((part) => part.trim());
  const [r, g, b, a] = parts;
  if (a === undefined || a === "1") {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const numbersOf = (value) =>
  String(value)
    .replace(/normal/g, "0")
    .match(/-?\d+(?:\.\d+)?/g)
    ?.map(Number) ?? [];

const layoutDiffers = (tailwind, emotion) => {
  const left = numbersOf(tailwind);
  const right = numbersOf(emotion);
  if (left.length !== right.length) {
    return true;
  }
  return left.some((value, index) => Math.abs(value - right[index]) > 1);
};

const paintDiffers = (key, tailwind, emotion) => {
  if (key === "fontFamily") {
    const clean = (value) => value.replaceAll('"', "").replaceAll("'", "").toLowerCase();
    return clean(tailwind) !== clean(emotion);
  }
  if (key === "fontSize" || key === "opacity") {
    return layoutDiffers(tailwind, emotion);
  }
  if (key.endsWith("Color") || key === "color") {
    return colorOf(tailwind) !== colorOf(emotion);
  }
  return tailwind !== emotion;
};

const diffsFor = (tailwind, emotion) => {
  const diffs = [];
  for (const key of paintKeys) {
    if (paintDiffers(key, tailwind[key], emotion[key])) {
      diffs.push({ property: key, tailwind: tailwind[key], emotion: emotion[key] });
    }
  }
  for (const key of layoutKeys) {
    if (layoutDiffers(tailwind[key], emotion[key])) {
      diffs.push({ property: key, tailwind: tailwind[key], emotion: emotion[key] });
    }
  }
  if (Boolean(tailwind.icon) !== Boolean(emotion.icon)) {
    diffs.push({ property: "icon", tailwind: tailwind.icon, emotion: emotion.icon });
  } else if (tailwind.icon && emotion.icon) {
    for (const key of ["x", "y", "width", "height"]) {
      if (Math.abs(tailwind.icon[key] - emotion.icon[key]) > 1) {
        diffs.push({
          property: `icon.${key}`,
          tailwind: tailwind.icon[key],
          emotion: emotion.icon[key],
        });
      }
    }
  }
  return diffs;
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
  throw new Error("layout page did not start");
};

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  await page.goto(origin);
  await page.locator("[data-case]").first().waitFor();

  const failures = [];
  const cases = page.locator("[data-case]");
  const count = await cases.count();
  for (let index = 0; index < count; index += 1) {
    const row = cases.nth(index);
    const id = await row.getAttribute("data-case");
    const disabled = (await row.getAttribute("data-disabled")) === "true";
    const tailwind = row.locator("[data-impl=tailwind] > *");
    const emotion = row.locator("[data-impl=emotion] > *");
    const states = disabled ? ["rest"] : ["rest", "hover", "focus"];
    for (const state of states) {
      await page.mouse.move(0, 0);
      if (state === "hover") {
        await tailwind.hover();
      }
      if (state === "focus") {
        await tailwind.focus();
      }
      const tailwindBox = await tailwind.evaluate(readBox);
      await page.mouse.move(0, 0);
      if (state === "hover") {
        await emotion.hover();
      }
      if (state === "focus") {
        await emotion.focus();
      }
      const emotionBox = await emotion.evaluate(readBox);
      const diffs = diffsFor(tailwindBox, emotionBox);
      if (diffs.length === 0) {
        continue;
      }
      const shot = failures.length < 12 ? `${id.replaceAll("/", "-")}-${state}.png` : null;
      if (shot) {
        await mkdir(outDir, { recursive: true });
        await row.screenshot({ path: `${outDir}/${shot}` });
      }
      failures.push({ id, state, diffs, screenshot: shot });
    }
  }

  await browser.close();
  if (failures.length > 0) {
    await mkdir(outDir, { recursive: true });
    await writeFile(
      `${outDir}/diff.json`,
      JSON.stringify({ ok: false, failures }, null, 2),
    );
    console.error(
      `compare-layout-styles: ${failures.length} cells differ. See scripts/compare-layout-styles/out/diff.json`,
    );
    process.exitCode = 1;
  } else {
    await rm(outDir, { recursive: true, force: true });
    console.log(`compare-layout-styles: ${count} nodes match on layout and styles`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopVite();
}
