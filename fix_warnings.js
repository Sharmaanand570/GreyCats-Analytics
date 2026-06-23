import fs from 'fs';
import path from 'path';

const filesToFix = [
  "src/features/googleAds/components/adGroups/AdGroupsTab.tsx",
  "src/features/googleAds/components/ads/AdsTab.tsx",
  "src/features/googleAds/components/assets/AssetsLibraryPage.tsx",
  "src/features/googleAds/components/audiences/AudiencesTab.tsx",
  "src/features/googleAds/components/campaigns/LiveCampaignsTable.tsx",
  "src/features/googleAds/components/conversions/ConversionsPage.tsx",
  "src/features/googleAds/components/keywords/KeywordsTab.tsx",
  "src/features/googleAds/components/keywords/NegativeKeywordsTab.tsx",
  "src/features/googleAds/components/keywords/SearchTermsTab.tsx",
  "src/features/googleAds/components/pmax/AssetGroupsPage.tsx",
  "src/features/googleAds/components/sharedLibrary/CampaignAssociationDrawer.tsx"
];

for (const relPath of filesToFix) {
  const fullPath = path.resolve('C:/greycats/greycats-analytics/greycats-analytics-v1', relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix data?.prop ?? [] logical expressions
  const regex = /const\s+(\w+)\s*=\s*data\?\.(\w+)\s*\?\?\s*\[\];/g;
  content = content.replace(regex, 'const $1 = useMemo(() => data?.$2 ?? [], [data?.$2]);');
  
  fs.writeFileSync(fullPath, content);
  console.log(`Fixed logical expressions in ${relPath}`);
}
