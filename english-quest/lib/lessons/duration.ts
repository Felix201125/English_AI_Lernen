/** Verteilt Minuten exakt auf n Aktivitäten (Summe = total). */
export function splitDurationExact(
  totalMinutes: number,
  weights: number[]
): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const sumW = weights.reduce((a, b) => a + b, 0) || n;
  const raw = weights.map((w) => (totalMinutes * w) / sumW);
  const floors = raw.map((x) => Math.max(1, Math.floor(x)));
  let used = floors.reduce((a, b) => a + b, 0);
  // zu viel → kürzen von den größten
  while (used > totalMinutes) {
    let idx = 0;
    for (let i = 1; i < floors.length; i++) {
      if (floors[i] > floors[idx]) idx = i;
    }
    if (floors[idx] <= 1) break;
    floors[idx] -= 1;
    used -= 1;
  }
  // zu wenig → Rest an größte Fraktion
  let remain = totalMinutes - used;
  const order = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  let k = 0;
  while (remain > 0 && k < 1000) {
    floors[order[k % order.length].i] += 1;
    remain -= 1;
    k += 1;
  }
  return floors;
}
