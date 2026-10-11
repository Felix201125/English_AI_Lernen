export function mockTranscribeGerman(seed?: string): string {
  const samples = [
    "Was kann ich als Nächstes machen?",
    "Ich möchte ein Spiel über Dinosaurier.",
    "Kannst du mir helfen?",
    "Ich will etwas mit Weltraum machen.",
  ];
  if (seed && seed.trim()) return seed.trim();
  return samples[Math.floor(Math.random() * samples.length)];
}

export function mockTranslateToEnglish(de: string): string {
  const map: Record<string, string> = {
    "Was kann ich als Nächstes machen?": "What can I do next?",
    "Ich möchte ein Spiel über Dinosaurier.": "I want a game about dinosaurs.",
    "Kannst du mir helfen?": "Can you help me?",
    "Ich will etwas mit Weltraum machen.": "I want to do something with space.",
  };
  return map[de] ?? `Translation: ${de}`;
}

export function mockTranslateWord(en: string): string {
  const map: Record<string, string> = {
    stadium: "Stadion",
    jersey: "Trikot",
    rocket: "Rakete",
    diamond: "Diamant",
  };
  return map[en.toLowerCase()] ?? `(DE) ${en}`;
}
