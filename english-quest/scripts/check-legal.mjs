#!/usr/bin/env node
/**
 * Produktions-Build-Guard: Pflichtfelder Impressum (§ 5 DDG).
 * Aufruf: REQUIRE_LEGAL=1 node scripts/check-legal.mjs
 * oder automatisch wenn NEXT_PUBLIC_SITE_URL gesetzt und kein FORCE_NOINDEX.
 */
const required = [
  "NEXT_PUBLIC_LEGAL_OPERATOR_NAME",
  "NEXT_PUBLIC_LEGAL_STREET",
  "NEXT_PUBLIC_LEGAL_ZIP_CITY",
  "NEXT_PUBLIC_LEGAL_EMAIL",
  "NEXT_PUBLIC_LEGAL_RESPONSIBLE",
];

const force = process.env.REQUIRE_LEGAL === "1";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
const noIndex = process.env.NEXT_PUBLIC_FORCE_NOINDEX === "1";
const looksProd =
  siteUrl &&
  !/devlearn\.klarland\.net/i.test(siteUrl) &&
  !/localhost/i.test(siteUrl) &&
  !noIndex;

if (!force && !looksProd) {
  console.log("check-legal: übersprungen (kein Produktions-Build)");
  process.exit(0);
}

const missing = required.filter((k) => !(process.env[k] || "").trim());
if (missing.length) {
  console.error(
    "check-legal: Pflichtangaben für Impressum fehlen:\n  " +
      missing.join("\n  ")
  );
  process.exit(1);
}
console.log("check-legal: OK");
