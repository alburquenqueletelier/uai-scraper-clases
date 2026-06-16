import { z } from "@hono/zod-openapi";

export const SessionSchema = z.object({
  tipo:     z.string().openapi({ example: "Clases no Regulares" }),
  evento:   z.string().openapi({ example: "SALA DISPONIBLE PARA ESTUDIAR" }),
  fecha:    z.string().openapi({ example: "2026-06-15" }),
  inicio:   z.string().openapi({ example: "08:00:00" }),
  fin:      z.string().openapi({ example: "09:40:00" }),
  sala:     z.string().openapi({ example: "AZ-101" }),
  edificio: z.string().openapi({ example: "Edificio A" }),
  campus:   z.string().openapi({ example: "Viña del Mar" }),
}).openapi("Session");

export type Session = z.infer<typeof SessionSchema>;
