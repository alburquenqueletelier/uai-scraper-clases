import type { Context, Next } from "hono";

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY no definida en .env");

export async function authorize(c: Context, next: Next): Promise<Response | void> {
  const key =
    c.req.header("x-api-key") ??
    c.req.header("authorization")?.replace("Bearer ", "");

  if (key !== API_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
}
