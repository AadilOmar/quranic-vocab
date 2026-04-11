import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const morphDir = join(__dirname, "../public/data/morphology");
const outFile = join(__dirname, "../public/data/lemma-counts.json");

const counts = {};

for (const file of readdirSync(morphDir)) {
  if (!file.endsWith(".json")) continue;
  const data = JSON.parse(readFileSync(join(morphDir, file), "utf-8"));
  for (const entry of Object.values(data)) {
    if (entry.lemma) {
      counts[entry.lemma] = (counts[entry.lemma] ?? 0) + 1;
    }
  }
}

writeFileSync(outFile, JSON.stringify(counts));
console.log(`Done. ${Object.keys(counts).length} unique lemmas.`);
