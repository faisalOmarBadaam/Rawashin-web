import { normalizeListQuery } from '@/shared/api/listQuery'
import { apiClient } from '../client'
import { endpoints } from '../endpoints'
import { api } from '../service'

import type {
  AddClientAttachmentResultDto,
  ClientAttachmentDto,
  ClientAttachmentPagedResult,
  ClientAttachmentsQueryParams,
} from '@/types/api/attachments'

export type AddClientAttachmentOptions = {
  /** Backend form field name. Defaults to `files`. */
  formFieldName?: string
  /** Extra form fields to send along with the file(s). */
  fields?: Record<string, string | number | boolean | undefined | null>
}

export const AttachmentsApi = {
  getClientAttachmentsPaged(clientId: string, params?: ClientAttachmentsQueryParams) {
    return api
      .get<
        ClientAttachmentDto[] | ClientAttachmentPagedResult
      >(endpoints.attachment.clientAttachments(clientId), normalizeListQuery('attachmentsByClient', params))
      .then(result => {
        if (Array.isArray(result)) {
          const pageNumber = params?.PageNumber ?? 1
          const pageSize = params?.PageSize ?? (result.length || 10)

          return {
            items: result,
            totalCount: result.length,
            pageNumber,
            pageSize,
            totalPages: pageSize > 0 ? Math.ceil(result.length / pageSize) : 1,
            hasPrevious: pageNumber > 1,
            hasNext: false,
          } satisfies ClientAttachmentPagedResult
        }

        return {
          ...result,
          items: result?.items ?? [],
        }
      })
  },

  getClientAttachments(clientId: string, params?: ClientAttachmentsQueryParams) {
    return this.getClientAttachmentsPaged(clientId, params).then(result => result.items ?? [])
  },

  addClientAttachment(
    clientId: string,
    files: File | File[],
    options?: AddClientAttachmentOptions,
  ) {
    const formData = new FormData()

    const fieldName = options?.formFieldName ?? 'files'
    const list = Array.isArray(files) ? files : [files]

    list.forEach(file => {
      formData.append(fieldName, file)
    })

    if (options?.fields) {
      for (const [key, value] of Object.entries(options.fields)) {
        if (value === undefined || value === null) continue
        formData.append(key, String(value))
      }
    }

    // Using ApiService will auto-handle ApiResponse<T> wrappers.
    // It also avoids forcing a multipart boundary header.
    return api.post<AddClientAttachmentResultDto[], FormData>(
      endpoints.attachment.addClientAttachment(clientId),
      formData,
    )
  },

  downloadById(id: string) {
    return apiClient
      .get(endpoints.attachment.downloadById(id), { responseType: 'blob' })
      .then(res => res.data as Blob)
  },

  deleteById(id: string) {
    return api.delete<void>(endpoints.attachment.deleteById(id))
  },
}
