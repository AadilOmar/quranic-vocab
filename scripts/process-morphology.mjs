/**
 * Downloads the Quranic morphology dataset and outputs one JSON file per surah
 * into public/data/morphology/{surahId}.json
 *
 * Output shape per surah:
 * {
 *   "1:1": { root: "سمو", lemma: "اسْم", pos: "noun" },
 *   "1:2": { root: "أله", lemma: "اللَّه", pos: "proper noun" },
 *   ...
 * }
 * Key format: "ayah:word" (surah is implied by file name)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/data/morphology");

const POS_MAP = {
  N: "noun",
  PN: "proper noun",
  V: "verb",
  P: "particle",
  PRON: "pronoun",
  DEM: "demonstrative",
  REL: "relative pronoun",
  T: "time adverb",
  LOC: "location adverb",
  CONJ: "conjunction",
  PCONJ: "particle",
  NEG: "negative particle",
  EX: "existential",
  VOC: "vocative",
  REM: "resumption",
  ANS: "answer",
  AVR: "aversion",
  CERT: "certainty",
  COND: "conditional",
  EMPH: "emphasis",
  EQ: "equalization",
  FUT: "future",
  INC: "inception",
  INT: "interrogative",
  INTG: "interrogative",
  INTERJ: "interjection",
  NEG: "negation",
  PREV: "prevention",
  PRO: "prohibition",
  RES: "restriction",
  RET: "retraction",
  SUP: "supplemental",
  SUR: "surprise",
};

function resolvePos(tag, features) {
  // Check features for sub-type first
  const featureParts = features.split("|");
  for (const part of featureParts) {
    if (POS_MAP[part]) return POS_MAP[part];
  }
  return POS_MAP[tag] || tag.toLowerCase();
}

async function main() {
  console.log("Downloading morphology data...");
  const res = await fetch(
    "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt"
  );
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const text = await res.text();

  console.log("Parsing...");
  // Group entries by surah
  const bySurah = {};

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const [location, , tag, features] = line.split("\t");
    if (!location || !tag || !features) continue;

    const [surahId, ayahId, wordId, segmentId] = location.split(":").map(Number);
    if (!surahId || !ayahId || !wordId || !segmentId) continue;

    // Skip prefixes/suffixes (segment 1 with PREF, or last segment with SUFF)
    // We want the stem — the segment that has ROOT in its features
    const hasRoot = features.includes("ROOT:");
    const hasLem = features.includes("LEM:");
    if (!hasRoot && !hasLem) continue;

    const surahKey = String(surahId);
    const wordKey = `${ayahId}:${wordId}`;

    // Extract root and lemma
    let root = null;
    let lemma = null;
    for (const feat of features.split("|")) {
      if (feat.startsWith("ROOT:")) root = feat.slice(5);
      else if (feat.startsWith("LEM:")) lemma = feat.slice(4);
    }

    const pos = resolvePos(tag, features);

    if (!bySurah[surahKey]) bySurah[surahKey] = {};

    // If word already has an entry with root, don't overwrite (keep first stem)
    const existing = bySurah[surahKey][wordKey];
    if (!existing || (!existing.root && root)) {
      bySurah[surahKey][wordKey] = { root, lemma, pos };
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const surahIds = Object.keys(bySurah).sort((a, b) => Number(a) - Number(b));
  for (const surahId of surahIds) {
    const filePath = resolve(OUT_DIR, `${surahId}.json`);
    writeFileSync(filePath, JSON.stringify(bySurah[surahId]));
  }

  console.log(`Done. Wrote ${surahIds.length} surah files to ${OUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
