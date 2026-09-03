import type { RequestHandler } from "express";
import { appError } from "../errors/app-error";

export const notFound: RequestHandler = (request, _response, next) => {
  next(appError(404, `${request.method} ${request.path} bulunamadı`, "NOT_FOUND"));
};
