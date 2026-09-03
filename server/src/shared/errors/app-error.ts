export const appError = (statusCode: number, message: string, code = "APP_ERROR") =>
  Object.assign(new Error(message), { statusCode, code });

export const isAppError = (
  error: unknown,
): error is Error & { statusCode: number; code: string } =>
  error instanceof Error &&
  "statusCode" in error &&
  typeof error.statusCode === "number";
