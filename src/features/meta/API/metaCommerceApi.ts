import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type MetaCatalog = {
  id: string;
  name: string;
  vertical?: string;
  product_count?: number;
};

export type MetaProductSet = {
  id: string;
  name: string;
  product_count?: number;
  catalog_id?: string;
};

export type MetaLeadForm = {
  id: string;
  name: string;
  status?: "ACTIVE" | "ARCHIVED" | "DRAFT" | "DELETED";
  locale?: string;
  created_time?: string;
  leads_count?: number;
};

export type CatalogsResponse = { success: boolean; data: MetaCatalog[] };
export type ProductSetsResponse = { success: boolean; data: MetaProductSet[] };
export type LeadFormsResponse = { success: boolean; data: MetaLeadForm[] };

type ApiErrorResponse = { message?: string; error?: string };

// ==================== API ====================

export const getCatalogs = async (clientId: number): Promise<MetaCatalog[]> => {
  try {
    const res = await api.get<CatalogsResponse>(`/clients/${clientId}/catalogs`);
    return res.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load catalogs"
    );
  }
};

export const getProductSets = async (
  clientId: number,
  catalogId: string
): Promise<MetaProductSet[]> => {
  try {
    const res = await api.get<ProductSetsResponse>(
      `/clients/${clientId}/catalogs/${catalogId}/product-sets`
    );
    return res.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load product sets"
    );
  }
};

export const getLeadForms = async (
  clientId: number,
  pageId: string
): Promise<MetaLeadForm[]> => {
  try {
    const res = await api.get<LeadFormsResponse>(
      `/clients/${clientId}/pages/${pageId}/lead-forms`
    );
    return res.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load lead forms"
    );
  }
};
