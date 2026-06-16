import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Session } from "../../scraper/index.ts";

const DATA_DIR = path.resolve(import.meta.dir, "../../..", "data");

export interface ClasesFilter {
  hora?: string;
  edificio?: string;
  sala?: string;
}

export async function readLatestClases(filter: ClasesFilter = {}): Promise<Session[] | null> {
  const files = await readdir(DATA_DIR).catch(() => [] as string[]);
  const latest = files
    .filter(f => /^clases-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .at(-1);

  if (!latest) return null;

  let clases = JSON.parse(await Bun.file(path.join(DATA_DIR, latest)).text()) as Session[];

  if (filter.hora)     clases = clases.filter(c => c.inicio === filter.hora);
  if (filter.edificio) clases = clases.filter(c => c.edificio === filter.edificio);
  if (filter.sala)     clases = clases.filter(c => c.sala === filter.sala);

  return clases;
}