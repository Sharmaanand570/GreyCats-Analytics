import localforage from "localforage";
import type { CampaignWizardState } from "./CampaignWizardContext";
import { v4 as uuidv4 } from "uuid";

export const CURRENT_WIZARD_SCHEMA_VERSION = "1.0";

export interface CampaignDraftMetadata {
  id: string;
  name: string;
  campaignType: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CampaignDraftRecord extends CampaignDraftMetadata {
  payload: CampaignWizardState;
}

// Initialize localforage store
const draftsStore = localforage.createInstance({
  name: "GreyCatsAnalytics",
  storeName: "CampaignDrafts",
});

export const DraftsManager = {
  /**
   * Save or update a draft.
   */
  async saveDraft(id: string | null, name: string, payload: CampaignWizardState, status: "DRAFT" | "PUBLISHED" = "DRAFT"): Promise<string> {
    const draftId = id || uuidv4();
    const now = new Date().toISOString();
    
    // Save to local storage for quick access
    const record: CampaignDraftRecord = {
      id: draftId,
      name,
      campaignType: payload.type || "UNKNOWN",
      createdAt: now,
      updatedAt: now,
      version: CURRENT_WIZARD_SCHEMA_VERSION,
      status,
      payload,
    };
    
    await draftsStore.setItem(draftId, record);

    // Sync to backend
    try {
      const match = window.location.pathname.match(/\/data-sources\/google-ads\/(\d+)/);
      const customerId = match ? match[1] : "1";
      await fetch("/api/google-ads/manage/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, payload: record }),
      });
    } catch (e) {
      console.warn("Backend draft sync failed", e);
    }

    return draftId;
  },

  /**
   * Get a specific draft.
   */
  async getDraft(id: string): Promise<CampaignDraftRecord | null> {
    // Try to get from backend first, fallback to local
    try {
      const match = window.location.pathname.match(/\/data-sources\/google-ads\/(\d+)/);
      const customerId = match ? match[1] : "1";
      const res = await fetch(`/api/google-ads/manage/drafts?customerId=${customerId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.draft && json.draft.payload && json.draft.payload.id === id) {
          return json.draft.payload;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch draft from backend", e);
    }

    const record = await draftsStore.getItem<CampaignDraftRecord>(id);
    if (!record) return null;

    if (record.version !== CURRENT_WIZARD_SCHEMA_VERSION) {
      return this.migrateDraft(record);
    }
    return record;
  },

  /**
   * List all drafts.
   */
  async listDrafts(): Promise<CampaignDraftMetadata[]> {
    const drafts: CampaignDraftMetadata[] = [];
    
    // Attempt backend fetch first
    try {
      const match = window.location.pathname.match(/\/data-sources\/google-ads\/(\d+)/);
      const customerId = match ? match[1] : "1";
      const res = await fetch(`/api/google-ads/manage/drafts?customerId=${customerId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.draft && json.draft.payload) {
          const p = json.draft.payload;
          drafts.push({
            id: p.id,
            name: p.name,
            campaignType: p.campaignType,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            version: p.version,
            status: p.status || "DRAFT",
          });
          return drafts;
        }
      }
    } catch (e) {
      console.warn("Backend drafts fetch failed, using local", e);
    }

    // Fallback to local
    const keysToDelete: string[] = [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await draftsStore.iterate((value: CampaignDraftRecord, key: string) => {
      const updatedDate = new Date(value.updatedAt);
      if (updatedDate < ninetyDaysAgo) {
        keysToDelete.push(key);
        return;
      }
      drafts.push({
        id: value.id,
        name: value.name,
        campaignType: value.campaignType,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
        version: value.version,
        status: value.status || "DRAFT",
      });
    });

    for (const key of keysToDelete) {
      await draftsStore.removeItem(key);
    }

    return drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async deleteDraft(id: string): Promise<void> {
    await draftsStore.removeItem(id);
    // Best effort backend delete
    try {
        await fetch(`/api/google-ads/manage/drafts/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Failed to delete draft from backend", e);
    }
  },

  async duplicateDraft(id: string): Promise<string | null> {
    const original = await this.getDraft(id);
    if (!original) return null;
    return await this.saveDraft(null, `${original.name} (Copy)`, original.payload);
  },

  migrateDraft(draft: CampaignDraftRecord): CampaignDraftRecord {
    draft.status = draft.status || "DRAFT";
    const migrated = JSON.parse(JSON.stringify(draft));
    if (!migrated.payload) migrated.payload = {};
    if (!migrated.payload.ads) migrated.payload.ads = [];
    if (!migrated.payload.adGroups) migrated.payload.adGroups = [];
    migrated.version = CURRENT_WIZARD_SCHEMA_VERSION;
    return migrated;
  }
};
