import { Response } from 'express';

export type SuccessJsonResponse<T> = {
  data: T;
  error?: never;
};

export type ErrorJsonResponse<T> = {
  data?: never;
  error: T;
};

export type JsonResponse<T, U = { message: string }> =
  | SuccessJsonResponse<T>
  | ErrorJsonResponse<U>;

export function createResponse<T, U = { message: string }>(
  res: Response,
  statusCode: number,
  body: JsonResponse<T, U>
): Response<JsonResponse<T, U>> {
  return res.status(statusCode).json(body);
}
