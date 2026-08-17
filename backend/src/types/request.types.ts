import type { Request } from 'express'

export type AppRequest<
  Params = Record<string, string>,
  ResponseBody = unknown,
  RequestBody = unknown,
  Query = Record<string, string>,
> = Request<Params, ResponseBody, RequestBody, Query>
