import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { PublishCompleteCampaignPayload } from "../types/googleAds.types";
import { DraftsManager } from "./DraftsManager";

export type CampaignWizardState = Partial<PublishCompleteCampaignPayload>;

interface CampaignWizardContextValue {
  payload: CampaignWizardState;
  updatePayload: (updates: Partial<CampaignWizardState>) => void;
  loadDraft: (draftId: string) => Promise<void>;
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  isPublishing: boolean;
  setIsPublishing: (val: boolean) => void;
  publishSnapshot: PublishCompleteCampaignPayload | null;
  takePublishSnapshot: () => void;
}

const CampaignWizardContext = createContext<CampaignWizardContextValue | undefined>(undefined);

export function CampaignWizardProvider({ children }: { children: React.ReactNode }) {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSnapshot, setPublishSnapshot] = useState<PublishCompleteCampaignPayload | null>(null);

  const [payload, setPayload] = useState<CampaignWizardState>({
    name: "New Campaign",
    type: "SEARCH",
    status: "PAUSED",
    budgetAmount: 10,
    budgetType: "DAILY",
    biddingFocus: "CONVERSIONS",
    networks: { searchPartners: true, displayNetwork: true },
    locations: { type: "ALL" },
    euPolitical: false,
    adGroups: [],
    ads: [],
    keywords: [],
    assets: [],
  });

  const isInitialLoad = useRef(true);

  // Auto-save debouncer
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (isPublishing) {
      // If we are publishing, changes should NOT overwrite the draft tied to this publish operation.
      // A sophisticated system might split the draft here. For now, we just halt auto-save during publish.
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const newDraftId = await DraftsManager.saveDraft(draftId, payload.name || "Draft Campaign", payload);
        if (!draftId) {
          setDraftId(newDraftId);
        }
      } catch (err) {
        console.error("Failed to auto-save draft", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [payload, draftId, isPublishing]);

  const updatePayload = (updates: Partial<CampaignWizardState>) => {
    // If locked by publish, prevent mutations to the active payload
    if (isPublishing) return;
    setPayload((prev) => ({ ...prev, ...updates }));
  };

  const loadDraft = async (id: string) => {
    const draft = await DraftsManager.getDraft(id);
    if (draft) {
      setPayload(draft.payload);
      setDraftId(id);
    }
  };

  const takePublishSnapshot = () => {
    // Deep clone to ensure UI mutations after publish do not affect the snapshot
    setPublishSnapshot(JSON.parse(JSON.stringify(payload)) as PublishCompleteCampaignPayload);
  };

  return (
    <CampaignWizardContext.Provider 
      value={{ 
        payload, 
        updatePayload, 
        loadDraft, 
        draftId, 
        setDraftId,
        isPublishing,
        setIsPublishing,
        publishSnapshot,
        takePublishSnapshot
      }}
    >
      {children}
    </CampaignWizardContext.Provider>
  );
}

export function useCampaignWizardContext() {
  const context = useContext(CampaignWizardContext);
  if (!context) {
    throw new Error("useCampaignWizardContext must be used within a CampaignWizardProvider");
  }
  return context;
}

