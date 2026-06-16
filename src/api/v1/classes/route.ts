import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getSessions } from "../../../scraper/index.ts";
import { rateLimit } from "../../middleware/rateLimit.ts";
import { readLatestClases } from "../../../services/classes/index.ts";
import { SessionSchema } from "../../../types/session.ts";

const ErrorSchema = z.object({ error: z.string() });

const QuerySchema = z.object({
  hora:     z.string().optional().openapi({ example: "08:00:00",   description: "Filtra por hora de inicio" }),
  edificio: z.string().optional().openapi({ example: "Edificio A", description: "Filtra por edificio" }),
  sala:     z.string().optional().openapi({ example: "AZ-101",     description: "Filtra por sala" }),
});

const getRoute = createRoute({
  method: "get",
  path: "/api/v1/classes",
  summary: "Listar clases del día",
  description: "Retorna las clases de Viña del Mar del día actual desde el caché local.",
  security: [{ ApiKeyAuth: [] }],
  request: { query: QuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.array(SessionSchema) } },
      description: "Listado de clases",
    },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "No autorizado" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Sin datos en caché" },
  },
});

const postRoute = createRoute({
  method: "post",
  path: "/api/v1/classes",
  summary: "Ejecutar scraper",
  description: "Descarga el Excel desde hoy.uai.cl y actualiza el caché de clases. Rate limit: 3/min, 50/día por IP.",
  security: [{ ApiKeyAuth: [] }],
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ ok: z.literal(true), total: z.number() }) } },
      description: "Scraper ejecutado",
    },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "No autorizado" },
    429: { content: { "application/json": { schema: ErrorSchema } }, description: "Rate limit excedido" },
    500: { content: { "application/json": { schema: ErrorSchema } }, description: "Error interno del scraper" },
  },
});

export const classesRouter = new OpenAPIHono();

classesRouter.openapi(getRoute, async (c) => {
  const { hora, edificio, sala } = c.req.valid("query");
  const clases = await readLatestClases({ hora, edificio, sala });
  if (!clases) {
    return c.json({ error: "Sin datos. Ejecuta POST /api/v1/classes para descargar." }, 404);
  }
  return c.json(clases, 200);
});

classesRouter.openapi(postRoute, async (c) => {
  const limited = rateLimit(c);
  if (limited) return c.json(limited, 429);

  try {
    const clases = await getSessions();
    return c.json({ ok: true as const, total: clases.length }, 200);
  } catch {
    return c.json({ error: "Fallo interno al ejecutar el scraper." }, 500);
  }
});
