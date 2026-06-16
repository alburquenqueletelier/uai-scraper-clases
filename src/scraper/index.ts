import puppeteer from "puppeteer";
import * as XLSX from "xlsx";
import path from "node:path";
import { mkdir, readdir, rename, unlink, stat } from "node:fs/promises";
import type { Session } from "../types/session.ts";

export type { Session };

const ROOT_DIR = path.resolve(import.meta.dir, "../..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const EXCEL_PATH = path.join(DATA_DIR, "eventos.xlsx");
/**
 * @description Scraper web to get all classes from Universidad Adolfo Ibáñez for the day when is executed.
 * @returns A list of all classes
 *  
 */
export async function getSessions(): Promise<Session[]> {

  await downloadExcel();
  const today = new Date().toISOString().split("T")[0]!;
  const jsonPath = path.join(DATA_DIR, `clases-${today}.json`);
  let classes: Session[] = [];

  try {
    classes = readAndFilterClases();
    await Bun.write(jsonPath, JSON.stringify(classes, null, 2));
    console.log(`[scraper] ${classes.length} clases de Viña del Mar → clases-${today}.json`);

  } catch (error) {
    console.log("Error: no fue posible procesar el excel descargado.");
    throw error;
  }
  await cleanOldJsonFiles(today);
  if (classes.length === 0) console.log("[scraper] No se encontraron clases.");
  return classes;
}

async function downloadExcel(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const beforeMs = Date.now();
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const client = await page.createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DATA_DIR,
    });

    console.log("[scraper] Visitando hoy.uai.cl…");
    await page.goto("https://hoy.uai.cl/", { waitUntil: "networkidle2" });

    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(el => {
        const text = el.textContent?.toLowerCase() ?? "";
        return text.includes("excel")
      });
      if (btn) { (btn as HTMLElement).click(); return true; }
      return false;
    });

    if (!clicked) throw new Error("Botón de descarga Excel no encontrado en hoy.uai.cl");

    console.log("[scraper] Descargando Excel…");
    const downloaded = await waitForDownload(DATA_DIR, beforeMs);

    if (downloaded !== EXCEL_PATH) {
      await rename(downloaded, EXCEL_PATH);
    }
    console.log("[scraper] Excel guardado en", EXCEL_PATH);
  } finally {
    await browser.close();
  }
}

/**
 * @description This function wait until the excel is completely downloaded to avoid an exception when tries to close puppeteer while it is attempting to download the file.
 * @param dir Directory where is alocated all the downloaded excel
 * @param afterMs Time to complete before execute the polling
 * @param timeoutMs Time to raise a TimeOut exception
 * @returns Path to the downloaded excel
 */
async function waitForDownload(dir: string, afterMs: number, timeoutMs = 30_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await Bun.sleep(500);
    const files = await readdir(dir);
    for (const f of files) {
      if (!f.endsWith(".xlsx") || f.includes(".crdownload")) continue;
      const fp = path.join(dir, f);
      const s = await stat(fp);
      if (s.mtimeMs > afterMs) return fp;
    }
  }
  throw new Error(`Descarga no completó en ${timeoutMs / 1000}s`);
}

function readAndFilterClases(): Session[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]!]!;
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { raw: false })
    .filter(r => r["Campus"] === "Viña del Mar")
    .map(r => ({
      tipo: r["Tipo"] ?? "",
      evento: r["Evento"] ?? "",
      fecha: r["Fecha"] ?? "",
      inicio: r["Inicio"] ?? "",
      fin: r["Fin"] ?? "",
      sala: r["Sala"] ?? "",
      edificio: r["Edificio"] ?? "",
      campus: r["Campus"] ?? "",
    }));
}

async function cleanOldJsonFiles(keepDate: string): Promise<void> {
  const files = await readdir(DATA_DIR);
  const toDelete = files.filter(
    f => /^clases-\d{4}-\d{2}-\d{2}\.json$/.test(f) && !f.includes(keepDate)
  );
  if (toDelete.length > 0) {
    await Promise.all(toDelete.map(f => unlink(path.join(DATA_DIR, f))));
    console.log("[scraper] Eliminados:", toDelete.join(", "));
  }
}
