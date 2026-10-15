import { readFileSync, readdirSync } from "node:fs";
import { Script } from "node:vm";
import { execFileSync } from "node:child_process";
for (const file of ["index.html", "legacy.html"]) {
  const html = readFileSync(file, "utf8");
  const scripts = [
    ...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi),
  ];
  for (const [i, m] of scripts.entries())
    new Script(m[1], { filename: `${file}-inline-${i + 1}` });
  if (!/<main\b/.test(html) || !/<\/html>/.test(html))
    throw Error("HTML structure incomplete");
}
for (const file of readdirSync(".").filter((x) => /\.(mjs|js)$/.test(x)))
  execFileSync(process.execPath, ["--check", file]);
JSON.parse(readFileSync("content/curriculum.json", "utf8"));
console.log(
  "PASS: both HTML entry points, external JS/modules, and curriculum JSON parse",
);
