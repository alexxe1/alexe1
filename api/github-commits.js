// Vercel Serverless Function: /api/github-commits
// Mantiene el token de GitHub en el servidor (NUNCA lo pongas en el front).
// Variables de entorno en Vercel:  GITHUB_TOKEN  (PAT con scope read:user)  y  GITHUB_USER (por defecto "alexxe1").
const QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { firstDay contributionDays { date contributionCount weekday } }
      }
    }
  }
}`;

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.GITHUB_USER || 'alexxe1';
  if (!token) return res.status(503).json({ error: 'GITHUB_TOKEN no configurado' });

  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(to.getUTCDate() - 365);

  try {
    const r = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'alexe1-portfolio' },
      body: JSON.stringify({ query: QUERY, variables: { login, from: from.toISOString(), to: to.toISOString() } }),
    });
    const json = await r.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return res.status(502).json({ error: 'Respuesta inesperada de GitHub', detail: json?.errors });
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ username: login, totalContributions: cal.totalContributions, weeks: cal.weeks });
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
