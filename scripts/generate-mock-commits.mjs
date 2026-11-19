// Genera src/data/github-commits.json con el MISMO formato que devuelve la API GraphQL de GitHub
// (user.contributionsCollection.contributionCalendar): 52 semanas x 7 días, semanas de domingo a sábado.
// Uso: npm run mock:commits
import { writeFileSync } from 'node:fs';

const USER = 'alexxe1';
const END = new Date(Date.UTC(2026, 10, 14)); // sábado 14/11/2026
const WEEKS = 52;

// PRNG determinístico (mulberry32) para que el mock sea reproducible
let seed = 0xa1e1e1;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const start = new Date(END); start.setUTCDate(END.getUTCDate() - (WEEKS * 7 - 1));
const weeks = [];
let total = 0;
let burst = 0;
for (let w = 0; w < WEEKS; w++) {
  // Ritmo anual: más actividad en vacaciones (dic-feb, jul) y en el cuatrimestre intenso (sep-nov)
  const weekStart = new Date(start); weekStart.setUTCDate(start.getUTCDate() + w * 7);
  const m = weekStart.getUTCMonth();
  const season = [1.2, 1.1, 0.5, 0.6, 0.8, 0.7, 1.3, 0.6, 0.9, 1.3, 1.5, 1.4][m];
  if (rnd() < 0.1) burst = 3 + Math.floor(rnd() * 4); // sprints de proyecto
  const weekMood = (burst > 0 ? 2.2 : 1) * season * (0.4 + rnd() * 1.2);
  if (burst > 0) burst--;
  const days = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(weekStart); date.setUTCDate(weekStart.getUTCDate() + d);
    const weekend = d === 0 || d === 6;
    const base = weekend ? 1.4 : 1.0;
    const p = Math.min(0.92, 0.38 * weekMood * base);
    let count = rnd() < p ? Math.max(1, Math.round(-Math.log(1 - rnd()) * 3.2 * weekMood)) : 0;
    if (count > 24) count = 24;
    total += count;
    days.push({ date: date.toISOString().slice(0, 10), contributionCount: count, weekday: d });
  }
  weeks.push({ firstDay: days[0].date, contributionDays: days });
}

const out = {
  _comment: 'MOCK generado por scripts/generate-mock-commits.mjs. Misma forma que contributionCalendar de la API GraphQL de GitHub.',
  username: USER,
  totalContributions: total,
  weeks,
};
writeFileSync(new URL('../src/data/github-commits.json', import.meta.url), JSON.stringify(out));
console.log(`github-commits.json: ${weeks.length} semanas, ${total} contribuciones, ${weeks[0].firstDay} → ${weeks.at(-1).contributionDays[6].date}`);
