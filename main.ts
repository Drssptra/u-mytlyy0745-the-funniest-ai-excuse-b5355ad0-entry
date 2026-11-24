const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const ENTRY =
  "I planned it perfectly, executed it flawlessly, and then saved the plan instead of the result.";

try {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "entry.txt"), ENTRY, "utf8");
} catch {
  // A failed write must never break the run.
}

process.stdout.write(ENTRY + "\n");
