import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const server = spawn(
  "http-server",
  ["storybook-static", "-p", "6006", "--silent"],
  { stdio: "ignore" },
);

const stop = () => {
  if (!server.killed) {
    server.kill("SIGTERM");
  }
};

try {
  let up = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:6006/iframe.html");
      if (response.ok) {
        up = true;
        break;
      }
    } catch {
      await delay(200);
    }
  }
  if (!up) {
    throw new Error("storybook static did not start");
  }

  const code = await new Promise((resolve) => {
    const test = spawn(
      "test-storybook",
      ["--url", "http://127.0.0.1:6006", "--maxWorkers=2"],
      { stdio: "inherit" },
    );
    test.on("exit", (exitCode) => resolve(exitCode ?? 1));
  });
  stop();
  process.exit(code);
} catch (error) {
  stop();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
