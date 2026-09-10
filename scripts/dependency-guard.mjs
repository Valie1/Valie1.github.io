import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const clean = (value = "") => value.replace(/^[~^<>= ]+/, "");
const parts = (value) => clean(value).split(".").map((item) => Number.parseInt(item, 10) || 0);
const gte = (a, b) => {
  const av = parts(a), bv = parts(b);
  for (let i = 0; i < 3; i += 1) {
    if (av[i] > bv[i]) return true;
    if (av[i] < bv[i]) return false;
  }
  return true;
};

const next = pkg.dependencies?.next;
const react = pkg.dependencies?.react;
const reactDom = pkg.dependencies?.["react-dom"];
const errors = [];
if (!next || !gte(next, "15.5.24")) errors.push(`Next.js must stay at 15.5.24+ in the V8 maintenance line; found ${next || "missing"}.`);
if (!react || !gte(react, "19.2.1")) errors.push(`React must stay on a patched 19.2.x release; found ${react || "missing"}.`);
if (!reactDom || clean(reactDom) !== clean(react)) errors.push(`react-dom must match react exactly; found ${reactDom || "missing"} vs ${react || "missing"}.`);
if (errors.length) {
  console.error("Dependency security guard failed:\n" + errors.map((item) => `  - ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Dependency guard OK — next ${next}, react ${react}, react-dom ${reactDom}.`);
