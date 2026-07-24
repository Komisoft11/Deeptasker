import type { DefaultError } from '@tanstack/query-core'
import { UseMutationOptions, useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query/src/types'
import { errorCatch } from '@/shared/api/api.helpers'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export const useCreateMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
>({
  onSuccess,
  onError,
  ...options
}: UseMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> => {
  const {
    dialogStore: { errorDialog }
  } = useRootStore()
  const mutation = useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onError: (e, variables, onMutateResult, context) => {
      errorDialog.loading = false
      errorDialog.error = errorCatch(e)
      errorDialog.tryFunction = () => mutation.mutateAsync(variables)
      onError?.(e, variables, onMutateResult, context)
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      errorDialog.clearError()
      onSuccess?.(data, variables, onMutateResult, context)
    }
  })

  return mutation
}
