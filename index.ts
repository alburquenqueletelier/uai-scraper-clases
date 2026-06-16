import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { classesRouter } from "./src/api/v1/classes/route.ts";
import { authorize } from "./src/api/middleware/authorization.ts";
import { startScheduler } from "./src/scheduler/index.ts";

const PORT = Number(process.env.PORT ?? 3000);

const app = new OpenAPIHono();

app.openAPIRegistry.registerComponent("securitySchemes", "ApiKeyAuth", {
  type: "apiKey",
  in: "header",
  name: "x-api-key",
  description: 'También acepta "Authorization: Bearer <key>"',
});

app.use("/api/*", authorize);
app.route("/", classesRouter);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "UAI Clases API",
    version: "1.0.0",
    description: "API para obtener el listado de clases del día en campus Viña del Mar.",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

startScheduler();

console.log(`[server] Docs → http://localhost:${PORT}/docs`);

export default { port: PORT, fetch: app.fetch };
