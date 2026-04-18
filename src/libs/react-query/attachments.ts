import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'

import { trackAttachmentUploaded } from '@/core/analytics/events'
import { AttachmentsApi, type AddClientAttachmentOptions } from '@/libs/api/modules'
import type { AddClientAttachmentResultDto, ClientAttachmentDto } from '@/types/api/attachments'
import { QueryKeys } from './queryKeys'

export const attachmentQueryKeys = {
  all: QueryKeys.attachments.all,
  client: (clientId: string) => QueryKeys.attachments.byClient(clientId),
}

export const useClientAttachmentsQuery = (
  clientId: string,
  options?: Omit<
    UseQueryOptions<
      ClientAttachmentDto[],
      unknown,
      ClientAttachmentDto[],
      ReturnType<typeof attachmentQueryKeys.client>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: attachmentQueryKeys.client(clientId),
    queryFn: () => AttachmentsApi.getClientAttachments(clientId),
    enabled: Boolean(clientId) && (options?.enabled ?? true),
    ...options,
  })
}

export type AddClientAttachmentVariables = {
  files: File | File[]
  options?: AddClientAttachmentOptions
}

export const useAddClientAttachmentMutation = (
  clientId: string,
  options?: UseMutationOptions<
    AddClientAttachmentResultDto[],
    unknown,
    AddClientAttachmentVariables
  >,
) => {
  const queryClient = useQueryClient()
  const userOnSuccess = options?.onSuccess

  return useMutation<AddClientAttachmentResultDto[], unknown, AddClientAttachmentVariables>({
    ...options,
    mutationFn: vars => AttachmentsApi.addClientAttachment(clientId, vars.files, vars.options),
    onSuccess: async (data, vars, onMutateResult, context) => {
      const filesCount = Array.isArray(vars.files) ? vars.files.length : 1

      trackAttachmentUploaded({
        entityType: 'client',
        entityId: clientId,
        module: 'attachments',
        filesCount,
      })

      await queryClient.invalidateQueries({ queryKey: attachmentQueryKeys.client(clientId) })
      await userOnSuccess?.(data, vars, onMutateResult, context)
    },
  })
}

export const useDownloadAttachmentMutation = (
  options?: UseMutationOptions<Blob, unknown, string>,
) => {
  return useMutation({
    mutationFn: id => AttachmentsApi.downloadById(id),
    ...options,
  })
}

export const useDeleteAttachmentMutation = (
  clientId: string,
  options?: UseMutationOptions<void, unknown, string>,
) => {
  const queryClient = useQueryClient()
  const userOnSuccess = options?.onSuccess

  return useMutation<void, unknown, string>({
    ...options,
    mutationFn: attachmentId => AttachmentsApi.deleteById(attachmentId),
    onSuccess: async (data, attachmentId, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: attachmentQueryKeys.client(clientId) })
      await userOnSuccess?.(data, attachmentId, onMutateResult, context)
    },
  })
}
