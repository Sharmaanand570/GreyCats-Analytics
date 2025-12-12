import { useQuery } from "@tanstack/react-query";
import {
  getMetaBusinessAccounts,
  type MetaBusinessAccountsResponse,
} from "../API/metaBusinessApi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

// ============ Meta Business (organic Facebook & Instagram) ============

export const useMetaBusinessAccounts = () => {
  return useQuery<MetaBusinessAccountsResponse, Error>({
    queryKey: ["meta-business", "accounts"],
    queryFn: () => getMetaBusinessAccounts(),
    ...commonQueryOptions,
  });
};
