import { de, type Dict } from "./de";

export type Locale = "de";

const catalogs: Record<Locale, Dict> = { de };

let locale: Locale = "de";

export function setLocale(next: Locale) {
  locale = next;
}

export function getLocale(): Locale {
  return locale;
}

export function t(): Dict {
  return catalogs[locale];
}

/** Einfache Platzhalter: "kostet {n} Credits" + { n: 5 } */
export function tf(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? "")
  );
}

export { de };
