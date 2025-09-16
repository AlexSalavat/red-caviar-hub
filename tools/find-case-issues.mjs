import fs from "node:fs";
import path from "node:path";

const exts = [".tsx", ".ts", ".jsx", ".js", ".json"];
const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "apps", "web", "src");

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function resolveWithExt(p) {
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  for (const e of exts) if (fs.existsSync(p + e)) return p + e;
  for (const e of exts) {
    const idx = path.join(p, "index" + e);
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

function checkImport(fromFile, spec) {
  if (!spec.startsWith("./") && !spec.startsWith("../") && !spec.startsWith("/")) return null;
  let target = spec.startsWith("/")
    ? path.join(srcRoot, spec.slice(1))
    : path.join(path.dirname(fromFile), spec);

  const resolved = resolveWithExt(target);
  if (!resolved) {
    return { type: "unresolved", fromFile, spec, hint: "Not found after extension/index resolution" };
  }

  // свер€ем фактический регистр по сегментам пути
  const rel = path.relative(projectRoot, resolved);
  const segs = rel.split(path.sep);
  let cur = projectRoot;
  const fsSegs = [];
  for (const seg of segs) {
    const items = fs.readdirSync(cur, { withFileTypes: true }).map(d => d.name);
    const found = items.find(n => n.toLowerCase() === seg.toLowerCase());
    fsSegs.push(found ?? seg);
    cur = path.join(cur, found ?? seg);
  }
  const actual = fsSegs.join(path.sep);
  if (actual !== rel) {
    return { type: "case-mismatch", fromFile, spec, resolved: rel, actual };
  }
  return null;
}

function parseImports(text) {
  const regs = [
    /import\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /export\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,
    /require\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  const specs = [];
  for (const r of regs) for (const m of text.matchAll(r)) specs.push(m[1]);
  return specs;
}

if (!fs.existsSync(srcRoot)) {
  console.error(" src not found:", srcRoot);
  process.exit(2);
}

const files = listFiles(srcRoot);
const issues = [];
for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  for (const spec of parseImports(txt)) {
    const r = checkImport(f, spec);
    if (r) issues.push(r);
  }
}

if (!issues.length) {
  console.log(" No import case issues found.");
  process.exit(0);
}

for (const it of issues) {
  if (it.type === "case-mismatch") {
    console.log(`CASE MISMATCH:
  from: ${path.relative(projectRoot, it.fromFile).replace(/\\/g,"/")}
  spec: ${it.spec}
  should match FS: ${it.actual.replace(/\\/g,"/")}
`);
  } else {
    console.log(`UNRESOLVED:
  from: ${path.relative(projectRoot, it.fromFile).replace(/\\/g,"/")}
  spec: ${it.spec}
  hint: ${it.hint}
`);
  }
}
process.exit(1);
