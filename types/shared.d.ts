declare module 'skedify-sdk' {
  export interface APIError<Entity> {
    code: string
    message: string
    ticket_id?: string
    fields?: {
      [Key in keyof Entity]?: string[]
    }
  }

  export interface APIResponse<Entity> {
    data: Entity
    warnings: unknown[]
    errors: APIError<Entity>[]
    status: number
    paging: PagingResponse
  }

  export interface PagingResponse {
    currentPage: number
    from: number
    hasNext: boolean
    hasPrevious: boolean
    totalPages: number
    size: number
    to: number
    totalResults: number
  }

  export interface BaseFields {
    id: string
    created_at: string
    enterprise_id: string
    external_id?: string | null
  }
}
