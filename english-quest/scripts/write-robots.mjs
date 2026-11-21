#!/usr/bin/env node
/** Schreibt public/robots.txt je nach Env (Dev = Disallow all). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const forceNoIndex = process.env.NEXT_PUBLIC_FORCE_NOINDEX === "1";
const isDev =
  forceNoIndex ||
  !siteUrl ||
  /devlearn\.klarland\.net/i.test(siteUrl) ||
  /localhost/i.test(siteUrl);

let body;
if (isDev) {
  body = `User-agent: *
Disallow: /

# Dev-/Staging-Host: nicht indexieren
`;
  if (siteUrl && !/devlearn|localhost/i.test(siteUrl)) {
    body += `\nSitemap: ${siteUrl}/sitemap.xml\n`;
  } else if (process.env.NEXT_PUBLIC_PRODUCTION_ORIGIN) {
    const prod = process.env.NEXT_PUBLIC_PRODUCTION_ORIGIN.replace(/\/$/, "");
    body += `\n# Kanonische Produktion\nSitemap: ${prod}/sitemap.xml\n`;
  }
} else {
  body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /student/
Disallow: /teacher/
Disallow: /parent/
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
`;
}

const out = path.join(root, "public", "robots.txt");
fs.writeFileSync(out, body, "utf8");
console.log(`robots.txt geschrieben (${isDev ? "noindex/dev" : "production"})`);
