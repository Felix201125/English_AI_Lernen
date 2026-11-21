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
  "/tutoren/",
  "/eltern/",
  "/lehrkraefte/",
  "/schulen/",
  "/faecher/",
  "/faecher/mathe/",
  "/faecher/mathe/prozentrechnung-klasse-6/",
  "/faecher/mathe/bruchrechnung-klasse-6/",
  "/faecher/deutsch/",
  "/faecher/deutsch/wortarten-klasse-5/",
  "/faecher/englisch/",
  "/faecher/englisch/vocabulary-klasse-5/",
  "/arbeitsblaetter/",
  "/arbeitsblaetter/mathe-prozent-6/",
  "/arbeitsblaetter/deutsch-wortarten-5/",
  "/arbeitsblaetter/englisch-vocab-5/",
  "/ratgeber/",
  "/ratgeber/lernen-mit-ki-eltern/",
  "/ratgeber/motivation-7-klasse/",
  "/ratgeber/vokabeln-mit-spielen/",
  "/faq/",
  "/kontakt/",
  "/impressum/",
  "/datenschutz/",
  "/login/",
  "/register/",
];

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
