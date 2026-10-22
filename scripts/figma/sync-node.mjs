import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Agent, CursorAgentError } from "@cursor/sdk";

const root = fileURLToPath(new URL("../..", import.meta.url));
const compareScript = fileURLToPath(new URL("./compare-node.mjs", import.meta.url));
const unmappedPath = fileURLToPath(new URL("./out/unmapped.json", import.meta.url));
const componentPath = fileURLToPath(new URL("./out/component.json", import.meta.url));

const uiRoot = "packages/ui/";
const tokensFile = "packages/ui/src/styles/tokens.css";
const hex = /#[0-9A-Fa-f]{3,8}\b/g;

const modelPath = (path) => path.startsWith(uiRoot) && path !== tokensFile;

const layerFor = (pascal) => (/Group$|Block$/.test(pascal) ? "molecules" : "atoms");

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

const absPath = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url));

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
    await readFile(path);
    return true;
  } catch {
    return false;
  }
};

const snapshotTree = async () => {
  const files = new Map();
  for (const row of await dirtyRows()) {
    files.set(row.path, await readFile(absPath(row.path), "utf8").catch(() => null));
  }
  return files;
};

const restore = async (path, before, after) => {
  if (!before.has(path)) {
    const row = after.find((item) => item.path === path);
    if (row?.code === "??") await git(["clean", "-f", "--", path]);
    else await git(["checkout", "--", path]);
    return;
  }
  const previous = before.get(path);
  if (previous == null) {
    await git(["clean", "-f", "--", path]);
    return;
  }
  await writeFile(absPath(path), previous);
};

const promptFor = (component, unmapped) => {
  const file =
    component.file ??
    `packages/ui/src/components/${layerFor(component.pascal)}/${component.pascal}/${component.pascal}.tsx`;
  return `component.json:
${JSON.stringify(component, null, 2)}

unmapped.json:
${unmapped}

Bring ${component.name} in line with unmapped.json.
Read the components next to it and packages/ui/src/styles/tokens.css. Copy the class style those files already use.

File: ${file}
Edit only files under packages/ui/. Do not edit packages/ui/src/styles/tokens.css.

If missing is true, create the file. Use cva when a sample axis has more than one value. The state axis is not a prop: hover and disabled are prefixes on the same classes (hover: and disabled:).
For a role in a sample, use the class when candidates has one entry. When it has several or none, copy the nearest existing branch and do not write a hex or a new CSS variable.

If values is set, the file already exists. For each missing value, copy one branch in that same group and apply the matching sample the same way.

If drift has kind "variant-override", do not change the shared token. Put that row's class on the cva branch named by props. A one-off length is an arbitrary class such as w-[320px]. Do not add a CSS variable for one branch. When class is null, use a candidate only if that branch lists exactly one; otherwise leave the branch.

Do not add props for keys under axes or states. Do not edit the file when the only keys are axes, states, or drift without kind "variant-override".

Do not write hex. Do not create a .figma.ts file. Do not edit packages/ui-emotion or scripts. Do not commit.
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

const addedHex = (before, after) => {
  const previous = new Set(before?.match(hex) ?? []);
  return (after.match(hex) ?? []).filter((item) => !previous.has(item));
};

const rejectPatch = async (before) => {
  const after = await dirtyRows();
  const touched = [];
  for (const row of after) {
    const now = await readFile(absPath(row.path), "utf8").catch(() => null);
    const previous = before.has(row.path) ? before.get(row.path) : undefined;
    if (previous === undefined || previous !== now) touched.push({ ...row, now, previous: previous ?? null });
  }
  const illegal = touched.filter(
    (row) => row.code.includes("D") || row.code.startsWith("R") || !modelPath(row.path),
  );
  const hexed = touched.filter(
    (row) => modelPath(row.path) && row.now && addedHex(row.previous, row.now).length > 0,
  );
  if (illegal.length === 0 && hexed.length === 0) return false;
  if (illegal.length > 0) {
    console.error(`sync-node: model edited unexpected files: ${illegal.map((row) => row.path).join(", ")}`);
  }
  for (const row of hexed) console.error(`sync-node: model wrote a hex in ${row.path}`);
  for (const row of touched) await restore(row.path, before, after);
  return true;
};

const agentCanHelp = (unmapped) =>
  unmapped.missing === true ||
  Object.keys(unmapped.values ?? {}).length > 0 ||
  (unmapped.drift ?? []).some((row) => row.kind === "variant-override");

const url = process.argv[2];
if (!url) {
  console.error("sync-node: pass a Figma node URL");
  process.exit(1);
}

let code = 1;
let modelCalls = 0;
for (;;) {
  code = await runCompare(url);
  if (code !== 2 || !(await exists(unmappedPath))) break;
  const unmapped = JSON.parse(await readFile(unmappedPath, "utf8"));
  if (!agentCanHelp(unmapped) || modelCalls >= 2) break;
  modelCalls += 1;
  console.log(`sync-node: unmapped, model attempt ${modelCalls}`);
  const before = await snapshotTree();
  const applied = await applyModel();
  if (applied !== 0) process.exit(applied);
  if (await rejectPatch(before)) process.exit(1);
}

process.exit(code);
