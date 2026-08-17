import type { FormEvent, ReactNode } from 'react'

export type FormSubmitHandler = (
  event: FormEvent<HTMLFormElement>,
) => void | Promise<void>
export type NavigateHandler<Page extends string = string> = (
  page: Page,
) => void | Promise<void>
export type StringUpdateHandler = (field: string, value: string) => void

export interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
