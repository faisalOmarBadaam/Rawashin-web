export type ClientAttachmentDto = {
  id: string
  clientId: string
  originalFileName?: string | null
  storedFileName?: string | null
  contentType?: string | null
  createdAt: string
}

export type ClientAttachmentPagedResult = {
  items?: ClientAttachmentDto[] | null
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPrevious?: boolean
  hasNext?: boolean
}

export type AddClientAttachmentResultDto = {
  attachmentId: string
  fileId: string
}

export type ClientAttachmentsQueryParams = {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean
  Search?: string
}
