import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestSchemas = Partial<Record<"body" | "params" | "query", ZodType>>;

export const validate = (schemas: RequestSchemas): RequestHandler =>
  async (request, _response, next) => {
    try {
      for (const key of Object.keys(schemas) as Array<keyof RequestSchemas>) {
        const schema = schemas[key];
        if (schema) request[key] = await schema.parseAsync(request[key]);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
