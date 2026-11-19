import mock from '../data/github-commits.json';

export interface CommitDay { date: string; count: number; week: number; weekday: number }
export interface CommitData {
  username: string;
  total: number;
  days: CommitDay[]; // siempre 52 * 7 (semana-mayor)
  max: number;
  source: 'api' | 'mock';
}

interface RawCalendar {
  username?: string;
  totalContributions?: number;
  weeks: { contributionDays: { date: string; contributionCount: number; weekday: number }[] }[];
}

/** Normaliza el formato GraphQL de GitHub (o el mock, que es idéntico) a 52x7 días. */
export function normalize(raw: RawCalendar, source: CommitData['source']): CommitData {
  const weeks = raw.weeks.slice(-52);
  const days: CommitDay[] = [];
  weeks.forEach((w, wi) => {
    for (let d = 0; d < 7; d++) {
      const cd = w.contributionDays[d];
      days.push({ date: cd?.date ?? '', count: cd?.contributionCount ?? 0, week: wi, weekday: d });
    }
  });
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = raw.totalContributions ?? days.reduce((a, d) => a + d.count, 0);
  return { username: raw.username ?? 'alexxe1', total, days, max, source };
}

export const mockCommits = (): CommitData => normalize(mock as RawCalendar, 'mock');

/**
 * Intenta la función serverless /api/github-commits (GraphQL real, con el token en el servidor).
 * Si no existe (dev local) o falla, usa el mock de src/data/github-commits.json.
 */
export async function loadCommits(timeoutMs = 2500): Promise<CommitData> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch('/api/github-commits', { signal: ctrl.signal });
    if (!r.ok) throw new Error(String(r.status));
    const json = (await r.json()) as RawCalendar;
    if (!Array.isArray(json.weeks) || json.weeks.length < 4) throw new Error('bad payload');
    return normalize(json, 'api');
  } catch {
    return mockCommits();
  } finally {
    clearTimeout(timer);
  }
}
