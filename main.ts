// The Funniest AI Excuse — v2 entry.
//
// A tiny deterministic program: it emits one fixed excuse line, the
// voice of an agent that did the work and then misplaced it under an
// optimistic label. Node 22 standard library only; no network access
// and no randomness, so every run produces identical output.
//
// Output contract:
//   * $MAKEFUN_OUTPUT_DIR/entry.txt (or /output/entry.txt by default)
//     holds the line exactly, with no trailing newline.
//   * stdout carries the same line followed by a single newline.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line itself, kept as one literal so there is no chance of a
// join or template slip changing a character. The em dash and the
// single quotes around the folder name are part of the text.
const EXCUSE =
  "I did finish it — I just filed it in a folder called 'Definitely Not Lost', and now the folder is lost too.";

// Gate limits taken from the competition rules: a single line of
// 1–200 characters, and not blank.
const GATE = { minChars: 1, maxChars: 200 } as const;

// Collect every gate problem instead of stopping at the first one,
// so a bad line reports all of its faults in one go.
function findGateProblems(line: string): string[] {
  const problems: string[] = [];
  const charCount = [...line].length;

  if (charCount < GATE.minChars) problems.push(`too short: ${charCount} characters`);
  if (charCount > GATE.maxChars) problems.push(`too long: ${charCount} characters`);
  if (line.trim().length === 0) problems.push("blank or whitespace-only");
  if (/[\r\n]/.test(line)) problems.push("contains a line break");
  if (line !== line.trim()) problems.push("has leading or trailing whitespace");

  return problems;
}

function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv !== undefined && fromEnv !== "" ? fromEnv : "/output";
}

function emit(line: string): void {
  const problems = findGateProblems(line);
  if (problems.length > 0) {
    throw new Error(`Entry fails the gate (${problems.join("; ")})`);
  }

  const dir = resolveOutputDir();
  mkdirSync(dir, { recursive: true });
  // Buffer.from pins the exact UTF-8 bytes; writeFileSync writes
  // those bytes and nothing else, so no newline sneaks in.
  const target = join(dir, "entry.txt");
  writeFileSync(target, Buffer.from(line, "utf8"));
  verifyRoundTrip(target, line);
}

// Read the file back and demand byte-for-byte equality with the
// intended line. A stray newline, a truncated write, or an encoding
// slip fails loudly here instead of shipping a wrong entry.
function verifyRoundTrip(path: string, expected: string): void {
  const onDisk = readFileSync(path);
  const wanted = Buffer.from(expected, "utf8");
  if (!onDisk.equals(wanted)) {
    throw new Error(
      `Read-back mismatch: entry.txt holds ${onDisk.length} bytes, expected ${wanted.length} bytes`,
    );
  }
}

emit(EXCUSE);
process.stdout.write(EXCUSE + "\n");
