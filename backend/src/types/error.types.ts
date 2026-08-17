export interface AppError extends Error {
  type?: string
  code?: number
}
