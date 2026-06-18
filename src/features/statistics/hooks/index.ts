import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../api";
import type { ClientType } from "@/shared/types/ClientType";


/**
 * 1. Hook for Clients Count
 */
export function useClientsCount(clientType?: ClientType) {
  return useQuery({
    queryKey: ['clientsCount', clientType],
    queryFn: () => statisticsApi.getClientsCount({ clientType }),
  })
}

/**
 * 2. Hook for Transactions Count
 */
export function useTransactionsCount(clientType?: ClientType) {
  return useQuery({
    queryKey: ['transactionsCount', clientType],
    queryFn: () => statisticsApi.getTransactionsCount({ clientType }),
  })
}

/**
 * 3. Hook for Transactions Total Sum
 */
export function useTransactionsTotalSum(clientType?: ClientType) {
  return useQuery({
    queryKey: ['transactionsTotalSum', clientType],
    queryFn: () => statisticsApi.getTransactionsTotalSum({ clientType }),
  })
}

/**
 * 4. Hook for Client Counters (for a given client type)
 */
export function useClientCounters(clientType: ClientType) {
  return useQuery({
    queryKey: ['clientCounters', clientType],
    queryFn: () => statisticsApi.getClientsCount({ clientType }),
  })
}
