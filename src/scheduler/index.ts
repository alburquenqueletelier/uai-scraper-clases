import cron from "node-cron";
import { getSessions } from "../scraper/index.ts";

const DEFAULT_TIME = "07:30";
const DEFAULT_TZ = "America/Santiago";

export function startScheduler(): void {
  const rawTime = process.env.TIME_EXECUTE_SCRAPER ?? DEFAULT_TIME;
  const tz = process.env.ZONE_EXECUTE_SCRAPER ?? DEFAULT_TZ;

  const [h, m] = rawTime.split(":").map(Number);
  if (h === undefined || m === undefined || isNaN(h) || isNaN(m)) {
    throw new Error(`TIME_EXECUTE_SCRAPER inválido: "${rawTime}". Formato esperado: HH:MM`);
  }

  cron.schedule(`${m} ${h} * * *`, async () => {
    console.log(`[scheduler] Ejecutando scraper programado (${rawTime} ${tz})`);
    try {
      await getSessions();
    } catch (err) {
      console.error("[scheduler] Error:", err);
    }
  }, { timezone: tz });

  console.log(`[scheduler] Programado → ${rawTime} (${tz})`);
}
