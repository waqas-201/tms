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
const typeIdx = headers.indexOf("Type");
const catIdx = headers.indexOf("Categories");
const imgIdx = headers.indexOf("Images");
const nameIdx = headers.indexOf("Name");
const idIdx = headers.indexOf("ID");

const categories = new Set<string>();
let variableCount = 0;
let simpleCount = 0;
let variationCount = 0;
let totalImages = 0;
const uniqueImages = new Set<string>();

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const type = row[typeIdx];
  const cat = row[catIdx] || "";
  const imgs = row[imgIdx] || "";

  if (cat) {
    cat.split(",").forEach((c) => categories.add(c.trim()));
  }

  if (type === "variable") variableCount++;
  else if (type === "simple") simpleCount++;
  else if (type === "variation") variationCount++;

  if (type === "variable" || type === "simple") {
    if (imgs) {
      imgs.split(",").map((s) => s.trim()).filter(Boolean).forEach((url) => {
        totalImages++;
        uniqueImages.add(url);
      });
    }
  }
}

console.log("=== CSV SUMMARY ===");
console.log(`Total Rows: ${rows.length - 1}`);
console.log(`Variable Parents: ${variableCount}`);
console.log(`Simple Products: ${simpleCount}`);
console.log(`Total Catalog Products: ${variableCount + simpleCount}`);
console.log(`Variations: ${variationCount}`);
console.log(`Total Parent Image References: ${totalImages}`);
console.log(`Unique Image URLs: ${uniqueImages.size}`);
console.log("\nCategories found in CSV:");
console.log(Array.from(categories).sort());
