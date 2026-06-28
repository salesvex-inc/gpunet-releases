#!/usr/bin/env node
// Records a freshly published version into versions.json so the static page
// and any consumer can read the current "latest" per product without hitting
// the GitHub API. Invoked by the release workflows:
//   node scripts/update-version.mjs <product> <version>
// product ∈ { desktop, node }

import { readFile, writeFile } from "node:fs/promises";

const [, , product, version] = process.argv;

if (!product || !version) {
  console.error("usage: update-version.mjs <desktop|node> <version>");
  process.exit(1);
}
if (!["desktop", "node"].includes(product)) {
  console.error(`unknown product "${product}" (expected desktop|node)`);
  process.exit(1);
}

const FILE = new URL("../versions.json", import.meta.url);

let data;
try {
  data = JSON.parse(await readFile(FILE, "utf8"));
} catch {
  data = { products: {} };
}
data.products ??= {};

const tagPrefix = product === "desktop" ? "desktop-v" : "node-v";
data.products[product] = {
  version,
  tag: `${tagPrefix}${version}`,
  releaseUrl: `https://github.com/salesvex-inc/gpunet-releases/releases/tag/${tagPrefix}${version}`,
};

await writeFile(FILE, JSON.stringify(data, null, 2) + "\n");
console.log(`recorded ${product} v${version}`);
