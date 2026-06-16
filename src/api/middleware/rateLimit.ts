import type { Context } from "hono";

interface IpRecord {
  minuteTs: number[];
  dayCount: number;
  dayReset: number;
}

const ipStore = new Map<string, IpRecord>();

export function rateLimit(
  c: Context,
  maxPerMin = 3,
  maxPerDay = 50,
): { error: string } | null {
  const ip =
    c.req.header("x-real-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";

  const now = Date.now();
  const todayStart = new Date(now).setHours(0, 0, 0, 0);

  let rec = ipStore.get(ip);
  if (!rec) {
    rec = { minuteTs: [], dayCount: 0, dayReset: todayStart };
    ipStore.set(ip, rec);
  }

  if (rec.dayReset < todayStart) {
    rec.dayCount = 0;
    rec.dayReset = todayStart;
  }

  rec.minuteTs = rec.minuteTs.filter(t => now - t < 60_000);

  if (rec.minuteTs.length >= maxPerMin)
    return { error: `Rate limit: máximo ${maxPerMin} requests por minuto` };
  if (rec.dayCount >= maxPerDay)
    return { error: `Rate limit: máximo ${maxPerDay} requests por día` };

  rec.minuteTs.push(now);
  rec.dayCount++;
  return null;
}
