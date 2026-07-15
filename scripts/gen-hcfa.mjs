import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csv = fs.readFileSync(path.join(__dirname, "who2006.csv"), "utf8").trim().split("\n").slice(4);
const M = { i: [], l: [], m: [], s: [] };
const F = { i: [], l: [], m: [], s: [] };

for (let month = 0; month <= 24; month++) {
  const targetYears = month / 12;
  const row = csv.find((line) => {
    const cols = line.split(",");
    return Number(cols[0]) === month && Math.abs(Number(cols[1]) - targetYears) < 0.0001;
  });
  if (!row) throw new Error(`missing month ${month}`);
  const c = row.split(",");
  M.i.push(month);
  M.l.push(Number(c[20]));
  M.m.push(Number(c[21]));
  M.s.push(Number(c[22]));
  F.i.push(month);
  F.l.push(Number(c[23]));
  F.m.push(Number(c[24]));
  F.s.push(Number(c[25]));
}

const out = path.join(__dirname, "..", "src", "data", "month-hcfa.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ M, F }));
console.log("wrote", out, M.i.length, "months");
