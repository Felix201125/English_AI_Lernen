#!/usr/bin/env node
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

const paths = [
  "/",
  "/ausprobieren/",
  "/preise/",
  "/eltern/",
  "/lehrkraefte/",
  "/schulen/",
  "/faecher/",
  "/faecher/mathe/",
  "/faecher/deutsch/",
  "/faecher/englisch/",
  "/faecher/naturwissenschaften/",
  "/faecher/geschichte/",
  "/faecher/language/",
  "/arbeitsblaetter/",
  "/ratgeber/",
  "/faq/",
  "/kontakt/",
  "/impressum/",
  "/datenschutz/",
  "/login/",
  "/register/",
  "/start/beispiel-mathe-fussball/",
];
// Keine /pricing/, /tutors/, /discover/, /tutoren/ in der Sitemap

const origin = siteUrl || "https://example.invalid";
const body = isDev
  ? `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Dev: Sitemap leer / nicht indexieren -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n`
  : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
      .map(
        (p) =>
          `  <url><loc>${origin}${p}</loc><changefreq>weekly</changefreq></url>`
      )
      .join("\n")}\n</urlset>\n`;

fs.writeFileSync(path.join(root, "public", "sitemap.xml"), body, "utf8");
console.log(`sitemap.xml geschrieben (${isDev ? "dev-empty" : "production"})`);
