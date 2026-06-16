# uai-scraper-classes
Scraper web para obtener las clases de la UAI campos Viña del mar. Consiste en una api para obtener la información y otra para scrapear la web.

## Structure
.
├── bun.lock
├── CLAUDE.md
├── data
│   ├── clases-2026-06-16.json
│   └── eventos.xlsx
├── docs
│   └── scraper-clases.drawio.png
├── index.ts
├── package.json
├── README.md
├── src
│   ├── api
│   │   ├── middleware
│   │   │   ├── authorization.ts
│   │   │   └── rateLimit.ts
│   │   └── v1
│   │       └── classes
│   │           └── route.ts
│   ├── scheduler
│   │   └── index.ts
│   ├── scraper
│   │   └── index.ts
│   ├── services
│   │   └── classes
│   │       └── index.ts
│   ├── types
│   │   └── session.ts
│   └── utils
│       └── keyGenerator.ts
└── tsconfig.json

14 directories, 17 files

## Stack

| Capa | Tecnología |
|------|------------|
| Runtime | [Bun](https://bun.com) v1.3+ |
| Lenguaje | TypeScript (strict) |
| Framework HTTP | [Hono](https://hono.dev) |
| Documentación API | [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) + Swagger UI |
| Validación / Schemas | [Zod](https://zod.dev) |
| Scraping | [Puppeteer](https://pptr.dev) v25 (Chromium headless) |
| Parsing Excel | [xlsx](https://sheetjs.com) |
| Scheduler | [node-cron](https://github.com/node-cron/node-cron) |

## Install
To install dependencies:

```bash
bun install
```

## Dev Excuted
To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.11. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
