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
    
    let createdAt = now;
    if (id) {
        const existing = await draftsStore.getItem<CampaignDraftRecord>(id);
        if (existing) createdAt = existing.createdAt;
    }
    
    const record: CampaignDraftRecord = {
      id: draftId,
      name,
      campaignType: payload.type || "UNKNOWN",
      createdAt,
      updatedAt: now,
      version: CURRENT_WIZARD_SCHEMA_VERSION,
      status,
      payload,
    };
    
    await draftsStore.setItem(draftId, record);
    return draftId;
  },

  /**
   * Get a specific draft.
   */
  async getDraft(id: string): Promise<CampaignDraftRecord | null> {
    const record = await draftsStore.getItem<CampaignDraftRecord>(id);
    if (!record) return null;

    // Apply migration if version mismatch
    if (record.version !== CURRENT_WIZARD_SCHEMA_VERSION) {
      return this.migrateDraft(record);
    }
    return record;
  },

  /**
   * List all drafts (without full payload to save memory).
   */
  async listDrafts(): Promise<CampaignDraftMetadata[]> {
    const drafts: CampaignDraftMetadata[] = [];
    const keysToDelete: string[] = [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await draftsStore.iterate((value: CampaignDraftRecord, key: string) => {
      // Auto-delete stale drafts older than 90 days
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

    // Cleanup stale drafts
    for (const key of keysToDelete) {
      console.log(`[DraftsManager] Deleting stale draft ${key} older than 90 days.`);
      await draftsStore.removeItem(key);
    }

    // Sort descending by updated date
    return drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  /**
   * Delete a draft.
   */
  async deleteDraft(id: string): Promise<void> {
    await draftsStore.removeItem(id);
  },

  /**
   * Duplicate a draft.
   */
  async duplicateDraft(id: string): Promise<string | null> {
    const original = await this.getDraft(id);
    if (!original) return null;
    
    return await this.saveDraft(null, `${original.name} (Copy)`, original.payload);
  },

  /**
   * Migration engine for old drafts.
   */
  migrateDraft(draft: CampaignDraftRecord): CampaignDraftRecord {
    console.warn(`Migrating draft ${draft.id} from v${draft.version || "0.x"} to v${CURRENT_WIZARD_SCHEMA_VERSION}`);
    
    // Ensure status exists
    draft.status = draft.status || "DRAFT";

    // Deep clone to avoid mutating localforage reference directly
    const migrated = JSON.parse(JSON.stringify(draft));

    // Handle structural migrations (e.g. flat array to nested)
    if (!migrated.payload) migrated.payload = {};
    if (!migrated.payload.ads) migrated.payload.ads = [];
    if (!migrated.payload.adGroups) migrated.payload.adGroups = [];

    // Fallback: update the version
    migrated.version = CURRENT_WIZARD_SCHEMA_VERSION;
    return migrated;
  }
};
