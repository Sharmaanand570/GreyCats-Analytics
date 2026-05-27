import fs from 'fs';

let c = fs.readFileSync('src/features/meta/components/adsWizard/types.ts', 'utf-8');

c = c.replace(/export enum CampaignObjective \{[^}]+\}/g, 'export type CampaignObjective = "OUTCOME_AWARENESS" | "OUTCOME_TRAFFIC" | "OUTCOME_ENGAGEMENT" | "OUTCOME_LEADS" | "OUTCOME_APP_PROMOTION" | "OUTCOME_SALES";');
c = c.replace(/export enum DestinationType \{[^}]+\}/g, 'export type DestinationType = "WEBSITE" | "APP" | "MESSENGER" | "INSTANT_FORMS" | "CALLS";');
c = c.replace(/export enum AdFormat \{[^}]+\}/g, 'export type AdFormat = "SINGLE_IMAGE_VIDEO" | "CAROUSEL" | "COLLECTION";');

// Add pixelId and conversionEvent
c = c.replace(/destinationType: DestinationType;/g, 'destinationType: DestinationType;\n  pixelId?: string;\n  conversionEvent?: string;');
c = c.replace(/destinationType: "WEBSITE",/g, 'destinationType: "WEBSITE",\n    pixelId: "",\n    conversionEvent: "",');

fs.writeFileSync('src/features/meta/components/adsWizard/types.ts', c);
console.log('Done types');
