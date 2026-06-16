# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Puppeteer scraper that extracts UAI (Universidad Adolfo Ibáñez) class schedules. Early-stage: skeleton exists in `src/scraper/main.ts`, entry point `index.ts` is a placeholder.

## Commands

```bash
bun install          # install deps
bun run index.ts     # run entry point
bun test             # run tests
bun test <file>      # run single test file
```

## Runtime: Bun

Use Bun APIs over Node equivalents:

- `bun <file>` not `node` / `ts-node`
- `Bun.file` not `fs.readFile` / `fs.writeFile`
- `Bun.$\`cmd\`` not `execa`
- `bun:sqlite` not `better-sqlite3`
- No `dotenv` — Bun loads `.env` automatically

## Architecture

```
index.ts                  # entry point: calls getSessions()
src/
  scraper/
    main.ts               # all scraper logic; exports getSessions() and Clase interface
eventos.xlsx              # downloaded Excel (overwritten on each run)
clases-YYYY-MM-DD.json    # filtered output (only latest date kept)
```

### `getSessions()` pipeline

1. Launches headless Chromium, visits `https://hoy.uai.cl/`
2. Clicks the Excel download button (detected by text/href containing "excel"/"xlsx")
3. Waits for `.xlsx` file to appear in project root, renames to `eventos.xlsx`
4. Reads with `xlsx`, filters `Campus === "Viña del Mar"`
5. Writes `clases-<today>.json`, deletes all older `clases-*.json` files

### Future REST service

`getSessions()` is designed to be called from an HTTP handler. The plan:
- `Bun.serve()` with a daily cron trigger
- Manual trigger endpoint that calls `getSessions()` on demand
- Serve the latest `clases-*.json` as an API response

## Puppeteer notes

- v25 ships bundled Chromium (~170MB download on first run).
- CDP `Page.setDownloadBehavior` routes downloads to `ROOT_DIR` (project root).
- DOM lib added to `tsconfig.json` so `page.evaluate()` callbacks type-check.
