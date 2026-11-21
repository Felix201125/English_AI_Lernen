#!/usr/bin/env node
/**
 * Smoke + Text-Check für öffentliche Seiten (static export out/ oder Dist).
 * Usage: node scripts/smoke-public.mjs [distDir]
 */
import fs from "fs";
import path from "path";

const root = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(process.cwd(), "out");

const requiredPaths = [
  "index.html",
  "impressum/index.html",
  "datenschutz/index.html",
  "login/index.html",
  "register/index.html",
  "preise/index.html",
  "tutoren/index.html",
  "ausprobieren/index.html",
  "demo/index.html",
  "probe/index.html",
  "faq/index.html",
  "eltern/index.html",
  "lehrkraefte/index.html",
  "schulen/index.html",
  "faecher/index.html",
  "faecher/mathe/index.html",
  "faecher/mathe/prozentrechnung-klasse-6/index.html",
  "arbeitsblaetter/index.html",
  "ratgeber/index.html",
  "robots.txt",
  "sitemap.xml",
  "start/beispiel-mathe-fussball/index.html",
];

const forbidden = [
  /Platzhalter/i,
  /NEXT_PUBLIC_/i,
  /Vom Betreiber ausfüllen/i,
  /Demo-Daten/i,
  /Demo-Angaben/i,
  /\bKonzept\b/i,
  /Zone\s*1/i,
  /Zone\s*2/i,
  /google_client_id/i,
  /api\/config/i,
  /\[Platzhalter/i,
  /Pflichtangaben fehlen noch/i,
];

let failed = false;

for (const rel of requiredPaths) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`FAIL missing: ${rel}`);
    failed = true;
    continue;
  }
  console.log(`OK 200-ish: ${rel}`);
}

function walkHtml(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "_next" || name === "api") continue;
      walkHtml(p, files);
    } else if (name.endsWith(".html")) {
      files.push(p);
    }
  }
  return files;
}

const publicRoots = [
  "",
  "impressum",
  "datenschutz",
  "login",
  "register",
  "preise",
  "tutoren",
  "ausprobieren",
  "demo",
  "probe",
].map((d) => (d ? path.join(root, d) : root));

const htmlFiles = [];
for (const d of publicRoots) {
  const index = path.join(d, d === root ? "index.html" : "index.html");
  if (fs.existsSync(index)) htmlFiles.push(index);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const re of forbidden) {
    if (re.test(html)) {
      console.error(`FAIL text-check ${path.relative(root, file)}: ${re}`);
      failed = true;
    }
  }
}

const robots = path.join(root, "robots.txt");
if (fs.existsSync(robots)) {
  const body = fs.readFileSync(robots, "utf8");
  const forceNoIndex = process.env.NEXT_PUBLIC_FORCE_NOINDEX === "1";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const isDev =
    forceNoIndex ||
    !siteUrl ||
    /devlearn\.klarland\.net/i.test(siteUrl) ||
    /localhost/i.test(siteUrl);
  if (isDev && !/Disallow:\s*\//i.test(body)) {
    console.error("FAIL robots.txt: Dev muss Disallow: / haben");
    failed = true;
  }
}

if (failed) {
  console.error("\nsmoke-public: FAILED");
  process.exit(1);
}
console.log("\nsmoke-public: OK");
