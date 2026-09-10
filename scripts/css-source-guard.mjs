import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "styles"].filter((dir) => fs.existsSync(dir));
const cssFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".css")) cssFiles.push(full);
  }
}

for (const root of roots) walk(root);

const failures = [];

function lineCol(text, index) {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const lastBreak = before.lastIndexOf("\n");
  return { line, column: index - lastBreak };
}

for (const file of cssFiles) {
  const css = fs.readFileSync(file, "utf8");
  let state = "code";
  let quote = null;
  let escaped = false;
  const stack = [];

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    const next = css[i + 1];

    if (state === "comment") {
      if (ch === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }

    if (state === "string") {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        state = "code";
        quote = null;
      }
      continue;
    }

    if (ch === "/" && next === "*") {
      state = "comment";
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      state = "string";
      quote = ch;
      continue;
    }



    if (ch === "\\" && ["n", "r", "t"].includes(next)) {
      const { line, column } = lineCol(css, i);
      failures.push(`${file}:${line}:${column} contains literal \\${next} in CSS source`);
    }

    if ("{[(".includes(ch)) stack.push({ ch, index: i });
    if ("}])".includes(ch)) {
      const expected = ch === "}" ? "{" : ch === "]" ? "[" : "(";
      const top = stack.pop();
      if (!top || top.ch !== expected) {
        const { line, column } = lineCol(css, i);
        failures.push(`${file}:${line}:${column} has unmatched ${ch}`);
      }
    }
  }

  if (state === "comment") failures.push(`${file} ends inside an unterminated comment`);
  if (state === "string") failures.push(`${file} ends inside an unterminated string`);
  for (const open of stack) {
    const { line, column } = lineCol(css, open.index);
    failures.push(`${file}:${line}:${column} has unmatched ${open.ch}`);
  }
}

if (failures.length) {
  console.error("CSS source guard FAILED:\n" + failures.map((item) => `  - ${item}`).join("\n"));
  process.exit(1);
}

console.log(`CSS source guard passed: ${cssFiles.length} stylesheet${cssFiles.length === 1 ? "" : "s"}; no serialized control escapes or unbalanced delimiters.`);
