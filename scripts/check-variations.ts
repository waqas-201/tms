import fs from "fs";
import path from "path";

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentField = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(currentField);
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(currentField);
      currentField = "";
      if (row.length > 1 || row[0] !== "") {
        lines.push(row);
      }
      row = [];
    } else {
      currentField += char;
    }
  }
  if (currentField || row.length > 0) {
    row.push(currentField);
    lines.push(row);
  }
  return lines;
}

const csvPath = path.resolve(__dirname, "../DATA/wc-product-export-2-10-2026-1790966996978.csv");
let content = fs.readFileSync(csvPath, "utf8");
if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

const rows = parseCSV(content);
const headers = rows[0].map((h) => h.replace(/^﻿/, "").trim());

type CsvRow = Record<string, string>;
const parents: CsvRow[] = [];
const variationsByParent = new Map<string, CsvRow[]>();
const allVariations: CsvRow[] = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const obj: CsvRow = {};
  headers.forEach((h, idx) => (obj[h] = row[idx] || ""));

  if (obj.Type === "variable" || obj.Type === "simple") {
    parents.push(obj);
  } else if (obj.Type === "variation") {
    allVariations.push(obj);
    const pRef = (obj.Parent || "").trim();
    if (!variationsByParent.has(pRef)) variationsByParent.set(pRef, []);
    variationsByParent.get(pRef)!.push(obj);
  }
}

let matchedVariationsCount = 0;
let parentsWithVariations = 0;
let parentsWithoutVariations = 0;

for (const p of parents) {
  const vars =
    variationsByParent.get(p.SKU) ||
    variationsByParent.get("id:" + p.ID) ||
    variationsByParent.get(p.ID) ||
    (p.SKU ? variationsByParent.get("id:" + p.SKU) : undefined) ||
    [];

  if (vars.length > 0) {
    matchedVariationsCount += vars.length;
    parentsWithVariations++;
  } else {
    parentsWithoutVariations++;
  }
}

console.log("=== VARIATION MATCHING CHECK ===");
console.log(`Total Parents: ${parents.length}`);
console.log(`Parents with matched variations: ${parentsWithVariations}`);
console.log(`Parents without variations (simple/single): ${parentsWithoutVariations}`);
console.log(`Total Variations in CSV: ${allVariations.length}`);
console.log(`Matched Variations: ${matchedVariationsCount}`);
console.log(`Unmatched Variations: ${allVariations.length - matchedVariationsCount}`);

if (allVariations.length - matchedVariationsCount > 0) {
  console.log("\nSample unmatched parent keys in variations:");
  for (const [key, vList] of variationsByParent.entries()) {
    const found = parents.some((p) => p.SKU === key || p.ID === key || "id:" + p.ID === key);
    if (!found) {
      console.log(`Key: "${key}", Count: ${vList.length}, Example Var Name: ${vList[0]?.Name}`);
    }
  }
}
