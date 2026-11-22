#!/usr/bin/env node
/**
 * Interner Link-Checker über gerenderte Public-HTML (out/ oder dist).
 * 404 = rot. Erwartete Redirects (pricing→preise etc.) werden als Dateien
 * mit Weiterleitungstext akzeptiert, wenn Ziel existiert.
 */
import fs from "fs";
import path from "path";

const root = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(process.cwd(), "out");

const SCAN = [
  "",
  "eltern",
  "lehrkraefte",
  "schulen",
  "faecher",
  "arbeitsblaetter",
  "ratgeber",
  "faq",
  "preise",
  "ausprobieren",
  "kontakt",
  "impressum",
  "datenschutz",
];

let failed = false;

function resolveInternal(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
    return null;
  }
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || clean === "/") return "index.html";
  const noSlash = clean.replace(/^\//, "").replace(/\/$/, "");
  return path.join(noSlash, "index.html");
}

function existsTarget(rel) {
  if (!rel) return true;
  return fs.existsSync(path.join(root, rel));
}

for (const dir of SCAN) {
  const file = path.join(root, dir, dir === "" ? "index.html" : "index.html");
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
  for (const href of hrefs) {
    const rel = resolveInternal(href);
    if (rel === null) continue;
    if (!existsTarget(rel)) {
      // Trailing-less .html fallback
      const alt = rel.replace(/\/index\.html$/, ".html");
      if (!existsTarget(alt) && !fs.existsSync(path.join(root, rel.replace(/\/index\.html$/, "")))) {
        console.error(`FAIL 404-link in ${dir || "/"}: ${href} → ${rel}`);
        failed = true;
      }
    }
  }
  console.log(`OK scanned: ${dir || "/"}`);
}

// Explizit zuvor tote Fach-Pfade
for (const p of [
  "faecher/language/index.html",
  "faecher/naturwissenschaften/index.html",
  "faecher/geschichte/index.html",
]) {
  if (!fs.existsSync(path.join(root, p))) {
    console.error(`FAIL missing bald-page: ${p}`);
    failed = true;
  } else console.log(`OK bald-page: ${p}`);
}

if (failed) {
  console.error("\ncheck-links: FAILED");
  process.exit(1);
}
console.log("\ncheck-links: OK");
