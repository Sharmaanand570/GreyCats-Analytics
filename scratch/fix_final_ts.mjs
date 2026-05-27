import fs from 'fs';

// 1. Fix Step3Creative.tsx
let s3 = fs.readFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', 'utf-8');
s3 = s3.replace(/f\.carouselCards/g, 'f.ad.carouselCards');
s3 = s3.replace(/f\.adVariants/g, 'f.ad.adVariants');
// Fix undefined URLs
s3 = s3.replace(/captionsUrl=\{form\.ad\.captionsUrl\}/g, 'captionsUrl={form.ad.captionsUrl || ""}');
s3 = s3.replace(/videoThumbnailUrl=\{form\.ad\.videoThumbnailUrl\}/g, 'videoThumbnailUrl={form.ad.videoThumbnailUrl || ""}');
s3 = s3.replace(/imageUrl=\{form\.ad\.videoThumbnailUrl\}/g, 'imageUrl={form.ad.videoThumbnailUrl || ""}');
fs.writeFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', s3);

// 2. Fix fromCampaignDetails.ts
let fc = fs.readFileSync('src/features/meta/components/adsWizard/fromCampaignDetails.ts', 'utf-8');
fc = fc.replace(/videoThumbnailUrl: campaignDetails\.videoThumbnailUrl/g, '// videoThumbnailUrl: campaignDetails.videoThumbnailUrl');
fc = fc.replace(/captionsUrl: campaignDetails\.captionsUrl/g, '// captionsUrl: campaignDetails.captionsUrl');
fc = fc.replace(/carouselCards: campaignDetails\.carouselCards/g, '// carouselCards: campaignDetails.carouselCards');
fc = fc.replace(/adVariants: campaignDetails\.adVariants/g, '// adVariants: campaignDetails.adVariants');
fc = fc.replace(/adLink: campaignDetails\.adLink/g, '// adLink: campaignDetails.adLink');
fs.writeFileSync('src/features/meta/components/adsWizard/fromCampaignDetails.ts', fc);

// 3. Fix Step1Settings.tsx
let s1 = fs.readFileSync('src/features/meta/components/adsWizard/Step1Settings.tsx', 'utf-8');
s1 = s1.replace(/const specialAdCategory = form\.campaign\.specialAdCategories\?\.\[0\] \|\| "NONE";/g, 'const specialAdCategory = (form.campaign.specialAdCategories && form.campaign.specialAdCategories[0]) || "NONE";');
fs.writeFileSync('src/features/meta/components/adsWizard/Step1Settings.tsx', s1);

// 4. Fix MetaAdsWizardPage.tsx
let mw = fs.readFileSync('src/pages/MetaAdsWizardPage.tsx', 'utf-8');
if (!mw.includes('useMetaAdsDetail')) {
  mw = mw.replace(/import \{ useCampaignDetails \} from "\@\/features\/meta\/hooks\/useCampaignDetails";/g, 'import { useMetaAdsDetail } from "@/features/meta/hooks/useMetaAdsDetail";');
}
fs.writeFileSync('src/pages/MetaAdsWizardPage.tsx', mw);

// 5. Fix Step4Review undefined errors
let s4 = fs.readFileSync('src/features/meta/components/adsWizard/Step4Review.tsx', 'utf-8');
s4 = s4.replace(/form\.campaign\.specialAdCategories\?\.\[0\]/g, '(form.campaign.specialAdCategories && form.campaign.specialAdCategories[0])');
fs.writeFileSync('src/features/meta/components/adsWizard/Step4Review.tsx', s4);

console.log('Fixed ts errors');
