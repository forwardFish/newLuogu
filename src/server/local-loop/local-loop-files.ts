import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "data", "local-loop");

export async function readLocalJson<T>(relativePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, relativePath), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function readLocalText(relativePath: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(ROOT, relativePath), "utf8");
  } catch {
    return null;
  }
}

export async function writeLocalJson(relativePath: string, value: unknown) {
  const target = path.resolve(ROOT, relativePath);
  const root = path.resolve(ROOT) + path.sep;
  if (!target.startsWith(root)) throw new Error("Refusing to write outside the project root");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export async function listAttemptAnalyses() {
  const dir = path.join(LOCAL_DIR, "attempt-analysis");
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name);
    return Promise.all(files.map(async (file) => readLocalJson(path.join("data", "local-loop", "attempt-analysis", file), { file })));
  } catch {
    return [];
  }
}

export async function runPnpm(args: string[]) {
  const display = `pnpm ${args.join(" ")}`;
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : "pnpm";
  const commandArgs = isWindows ? ["/d", "/c", "pnpm", ...args] : args;
  const { stdout, stderr } = await execFileAsync(command, commandArgs, { cwd: ROOT, maxBuffer: 20 * 1024 * 1024 });
  return { command: display, stdout, stderr };
}
