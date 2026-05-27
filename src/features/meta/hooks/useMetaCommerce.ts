import { useQuery } from "@tanstack/react-query";
import {
  getCatalogs,
  getLeadForms,
  getProductSets,
  type MetaCatalog,
  type MetaLeadForm,
  type MetaProductSet,
} from "../API/metaCommerceApi";

// Catalogs are owned by a Business Manager. They change rarely; long staleTime
// is fine. Pass clientId=null to disable.
export const useCatalogs = (clientId: number | null) => {
  return useQuery<MetaCatalog[], Error>({
    queryKey: ["meta-commerce", "catalogs", clientId],
    queryFn: () => getCatalogs(clientId as number),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Product sets live under a catalog. Disabled until the user picks a catalog.
export const useProductSets = (clientId: number | null, catalogId: string | null) => {
  return useQuery<MetaProductSet[], Error>({
    queryKey: ["meta-commerce", "product-sets", clientId, catalogId],
    queryFn: () => getProductSets(clientId as number, catalogId as string),
    enabled: !!clientId && !!catalogId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Lead forms are attached to a Facebook Page. Required for LEADS-objective ads.
export const useLeadForms = (clientId: number | null, pageId: string | null) => {
  return useQuery<MetaLeadForm[], Error>({
    queryKey: ["meta-commerce", "lead-forms", clientId, pageId],
    queryFn: () => getLeadForms(clientId as number, pageId as string),
    enabled: !!clientId && !!pageId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
