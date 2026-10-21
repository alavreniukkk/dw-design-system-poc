import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Agent, CursorAgentError } from "@cursor/sdk";

const root = fileURLToPath(new URL("../..", import.meta.url));
const compareScript = fileURLToPath(new URL("./compare-node.mjs", import.meta.url));
const unmappedPath = fileURLToPath(new URL("./out/unmapped.json", import.meta.url));
const componentPath = fileURLToPath(new URL("./out/component.json", import.meta.url));

const uiRoot = "packages/ui/";
const tokensFile = "packages/ui/src/styles/tokens.css";

const modelPath = (path) => path.startsWith(uiRoot) && path !== tokensFile;

const hex = /#[0-9A-Fa-f]{3,8}\b/;

const git = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd: root });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new Error(stderr.trim() || `git ${args.join(" ")} exited ${code}`));
    });
  });

const dirtyRows = async () => {
  const text = await git(["status", "--porcelain=v1", "-uall"]);
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => ({ code: line.slice(0, 2), path: line.slice(3) }));
};

const runCompare = (url) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [compareScript, url], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const revert = async (paths) => {
  const wanted = new Set(paths);
  const tracked = [];
  const untracked = [];
  for (const row of await dirtyRows()) {
    if (!wanted.has(row.path)) {
      continue;
    }
    if (row.code === "??") {
      untracked.push(row.path);
    } else {
      tracked.push(row.path);
    }
  }
  if (tracked.length > 0) {
    await git(["checkout", "--", ...tracked]);
  }
  if (untracked.length > 0) {
    await git(["clean", "-f", "--", ...untracked]);
  }
};

const promptFor = (component, unmapped) => {
  const layer = component.pascal.endsWith("Group") ? "molecules" : "atoms";
  const file =
    component.file ??
    `packages/ui/src/components/${layer}/${component.pascal}/${component.pascal}.tsx`;
  return `component.json:
${JSON.stringify(component, null, 2)}

unmapped.json:
${unmapped}

${component.name} is missing a variant, a size, or the component file.

Prefix: ${component.slug}
Component file: ${file}

Edit only files inside packages/ui/. Do not edit packages/ui/src/styles/tokens.css. The script writes tokens on the next pass.

If missing is true, create ${file} as a native element with cva. Copy the shape of an existing component in packages/ui/src/components: groups only for axes listed in unmapped. Utilities use the prefix, not hex:
- variant "<value>": "bg-${component.slug}-<value> text-${component.slug}-<value>-fg border-${component.slug}-<value>-border hover:bg-${component.slug}-<value>-hover"
- size "<value>": "h-${component.slug}-<value> px-${component.slug}-x-<value> py-${component.slug}-y-<value> text-${component.slug}-<value>"
Add @theme inline entries that point those utilities at --${component.slug}-* variables.
Add the new class stems to the matching groups in packages/ui/src/utils/cn.ts.
Add stories and a render test beside the component.

If the file exists, copy one existing branch in that same group. Do not invent a second pattern.
For each name in variants, append it to argTypes.variant.options and add a story:
  export const <Pascal>: Story = { args: { variant: "<value>" } };
  <Pascal> is "<value>" with the first letter uppercased.
For each name in sizes, append it to argTypes.size.options and the @theme size entries above. No new story for a size.
For each name in contents, copy an existing content branch and append the option.
For each name in aligns, append it to argTypes.align.options and add a story the same way as a variant.

If axes, states, or disabled is set, do not edit files.

Do not write hex. Do not create a .figma.ts file. Do not edit packages/ui-emotion, brand.css, or scripts. Do not commit.
`;
};

const applyModel = async () => {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    console.error("sync-node: add repository secret CURSOR_API_KEY");
    return 1;
  }
  const unmapped = await readFile(unmappedPath, "utf8");
  const component = JSON.parse(await readFile(componentPath, "utf8"));
  let result;
  try {
    result = await Agent.prompt(promptFor(component, unmapped), {
      apiKey,
      model: { id: "grok-4.7" },
      tools: ["read", "edit", "grep", "glob", "ls"],
      local: { cwd: root },
    });
  } catch (error) {
    if (error instanceof CursorAgentError) {
      console.error(`sync-node: ${error.message}`);
      return 1;
    }
    throw error;
  }
  console.log(`sync-node: agent ${result.id} ${result.status}`);
  if (result.status !== "finished") {
    console.error(result.error?.message ?? result.status);
    return 1;
  }
  return 0;
};

const rejectPatch = async () => {
  const rows = await dirtyRows();
  const illegal = rows.filter(
    (row) => row.code.includes("D") || row.code.startsWith("R") || !modelPath(row.path),
  );
  if (illegal.length > 0) {
    console.error(
      `sync-node: model edited unexpected files: ${illegal.map((row) => row.path).join(", ")}`,
    );
    await revert(rows.map((row) => row.path));
    return true;
  }
  for (const row of rows) {
    const text = await readFile(fileURLToPath(new URL(`../../${row.path}`, import.meta.url)), "utf8");
    if (hex.test(text)) {
      console.error(`sync-node: model wrote a hex in ${row.path}`);
      await revert(rows.map((entry) => entry.path));
      return true;
    }
  }
  return false;
};

const url = process.argv[2];
if (!url) {
  console.error("sync-node: pass a Figma node URL");
  process.exit(1);
}

let code = 1;
let modelCalls = 0;
for (;;) {
  code = await runCompare(url);
  if (code !== 2 || !(await exists(unmappedPath))) {
    break;
  }
  if (modelCalls >= 2) {
    break;
  }
  modelCalls += 1;
  console.log(`sync-node: unmapped, model attempt ${modelCalls}`);
  const applied = await applyModel();
  if (applied !== 0) {
    process.exit(applied);
  }
  if (await rejectPatch()) {
    process.exit(1);
  }
}

process.exit(code);
