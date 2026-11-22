#!/usr/bin/env node
/**
 * Asset-Smoke gegen eine Origin (Apache/Pagespeed-Befund vom 21.11.2026).
 *
 * Lokal (statischer Export-Ordner):
 *   node scripts/smoke-assets.mjs out
 *
 * Gegen Deploy-Origin:
 *   BASE_URL=https://devlearn.klarland.net node scripts/smoke-assets.mjs
 *
 * Rot wenn:
 * - referenzierte /_next/static/-URL nicht 200
 * - URL enthält "pagespeed" (z. B. .pagespeed.ce. / .pagespeed.cf.)
 */
import fs from "fs";
import path from "path";

const BASE = (process.env.BASE_URL || "").replace(/\/$/, "");
const localRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : BASE
    ? null
    : path.resolve(process.cwd(), "out");

const PAGES = [
  "/",
  "/login/",
  "/register/",
  "/ausprobieren/",
];

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { res, text, finalUrl: res.url };
}

function extractAssetUrls(html, pageUrl) {
  const urls = new Set();
  const re =
    /(?:href|src)=["']([^"']+\.(?:css|js)(?:\?[^"']*)?)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const abs = new URL(m[1], pageUrl).href;
      urls.add(abs);
    } catch {
      /* ignore bad urls */
    }
  }
  return [...urls];
}

function isOwnAsset(url, origin) {
  try {
    const u = new URL(url);
    if (origin && u.origin !== origin) return false;
    return (
      u.pathname.includes("/_next/") ||
      u.pathname.endsWith(".css") ||
      u.pathname.endsWith(".js")
    );
  } catch {
    return false;
  }
}

async function checkRemote() {
  const origin = new URL(BASE).origin;
  console.log(`smoke-assets: remote ${BASE}`);
  for (const p of PAGES) {
    const pageUrl = `${BASE}${p}`;
    const { res, text } = await fetchText(pageUrl);
    if (!res.ok) {
      fail(`page ${p} → HTTP ${res.status}`);
      continue;
    }
    if (/pagespeed/i.test(text) && /_next\/static/i.test(text)) {
      // pagespeed in rewritten asset paths inside HTML
      const bad = [...text.matchAll(/["']([^"']*pagespeed[^"']*)["']/gi)].map(
        (x) => x[1]
      );
      if (bad.some((b) => /_next|pagespeed\.(ce|cf)/i.test(b))) {
        fail(`page ${p}: HTML enthält pagespeed-Asset-URLs`);
      }
    }
    const assets = extractAssetUrls(text, pageUrl).filter((u) =>
      isOwnAsset(u, origin)
    );
    if (assets.length === 0 && p === "/") {
      fail(`page ${p}: keine eigenen CSS/JS-Links gefunden`);
    }
    for (const asset of assets) {
      if (/pagespeed/i.test(asset)) {
        fail(`pagespeed in Asset-URL: ${asset}`);
        continue;
      }
      const aRes = await fetch(asset, { method: "HEAD" }).catch(() => null);
      const ok =
        aRes &&
        (aRes.ok ||
          (await fetch(asset).then((r) => r.ok).catch(() => false)));
      if (!ok) fail(`asset HTTP fail: ${asset}`);
      else console.log(`OK asset: ${asset}`);
    }
    console.log(`OK page: ${p}`);
  }
}

function walkHtmlFiles(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "api" || name === "node_modules") continue;
      walkHtmlFiles(p, files);
    } else if (name === "index.html" || name.endsWith(".html")) {
      files.push(p);
    }
  }
  return files;
}

function extractLocalAssetPaths(html) {
  const paths = new Set();
  const re =
    /(?:href|src)=["'](\/_next\/[^"']+\.(?:css|js)(?:\?[^"']*)?)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    paths.add(m[1].split("?")[0]);
  }
  return [...paths];
}

function checkLocal() {
  console.log(`smoke-assets: local ${localRoot}`);
  if (!fs.existsSync(localRoot)) {
    fail(`Ordner fehlt: ${localRoot}`);
    return;
  }
  const htaccess = path.join(localRoot, ".htaccess");
  if (fs.existsSync(htaccess)) {
    const h = fs.readFileSync(htaccess, "utf8");
    if (!/ModPagespeed\s+off/i.test(h) && !/ModPagespeedDisallow/i.test(h)) {
      fail(".htaccess ohne ModPagespeed off / Disallow für /_next/");
    } else {
      console.log("OK .htaccess: Pagespeed-Schutz vorhanden");
    }
  } else {
    console.warn(
      "WARN: keine .htaccess im Export (ok für reines out/ vor build:hetzner)"
    );
  }

  for (const p of PAGES) {
    const rel =
      p === "/"
        ? "index.html"
        : path.join(p.replace(/^\//, "").replace(/\/$/, ""), "index.html");
    const file = path.join(localRoot, rel);
    if (!fs.existsSync(file)) {
      fail(`missing page file: ${rel}`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    if (/pagespeed/i.test(html)) {
      fail(`${rel}: enthält "pagespeed"`);
    }
    const assets = extractLocalAssetPaths(html);
    if (assets.length === 0 && p === "/") {
      fail(`page ${p}: keine /_next/-Assets im HTML`);
    }
    for (const assetPath of assets) {
      if (/pagespeed/i.test(assetPath)) {
        fail(`pagespeed in Asset-URL: ${assetPath}`);
        continue;
      }
      const fp = path.join(localRoot, assetPath.replace(/^\//, ""));
      if (!fs.existsSync(fp)) fail(`missing /_next asset: ${assetPath}`);
      else console.log(`OK local asset: ${assetPath}`);
    }
    console.log(`OK page file: ${rel}`);
  }
}

async function main() {
  process.exitCode = 0;
  if (BASE) await checkRemote();
  else checkLocal();
  if (process.exitCode) {
    console.error("\nsmoke-assets: FAILED");
    process.exit(1);
  }
  console.log("\nsmoke-assets: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
