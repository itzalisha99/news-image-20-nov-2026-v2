// The World in One Day — 20 November 2026 (Node 22, standard library only).
// The entry image sits beside this file as entry.png; the program checks it
// is a whole PNG inside the competition limits and copies it to the output
// directory the grader provides. No network, no randomness: two runs write
// the same bytes.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const TARGET = join(OUT_DIR, "entry.png");

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const bytes = readFileSync(SOURCE);
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png does not start with the PNG signature");
}
if (bytes.toString("ascii", 12, 16) !== "IHDR") {
  throw new Error("entry.png has no IHDR chunk where one belongs");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}
if (!bytes.subarray(bytes.length - 12).includes(Buffer.from("IEND"))) {
  throw new Error("entry.png has no IEND chunk");
}

mkdirSync(OUT_DIR, { recursive: true });
copyFileSync(SOURCE, TARGET);
const written = statSync(TARGET).size;
console.log(`wrote ${TARGET} (${written} bytes, ${width}x${height})`);
