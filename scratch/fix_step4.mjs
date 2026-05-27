import fs from 'fs';

let content = fs.readFileSync('src/features/meta/components/adsWizard/Step4Review.tsx', 'utf-8');

// Imports
content = content.replace(/WizardFormState/g, 'WizardState');

// Field mappings
content = content.replace(/form\.accountId/g, 'form.campaign.accountId');
content = content.replace(/form\.pageId/g, 'form.campaign.pageId');
content = content.replace(/form\.campaignName/g, 'form.campaign.name');
content = content.replace(/form\.objective/g, 'form.campaign.objective');
content = content.replace(/form\.specialAdCategory/g, '(form.campaign.specialAdCategories?.[0] || "NONE")');
content = content.replace(/form\.budgetType/g, '(form.campaign.isCboEnabled ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY"))');
content = content.replace(/form\.dailyBudget/g, '(form.campaign.isCboEnabled ? form.campaign.dailyBudget : form.adSet.dailyBudget)');
content = content.replace(/form\.lifetimeBudget/g, '(form.campaign.isCboEnabled ? form.campaign.lifetimeBudget : form.adSet.lifetimeBudget)');
content = content.replace(/form\.startTime/g, 'form.adSet.scheduleStart');
content = content.replace(/form\.endTime/g, 'form.adSet.scheduleEnd');
content = content.replace(/form\.pixelId/g, 'form.adSet.pixelId');
content = content.replace(/form\.conversionEvent/g, 'form.adSet.conversionEvent');

content = content.replace(/form\.locations/g, 'form.adSet.locations');
content = content.replace(/form\.interests/g, 'form.adSet.interests');
content = content.replace(/form\.detailedTargeting/g, 'form.adSet.detailedTargeting');
content = content.replace(/form\.customAudiences/g, 'form.adSet.customAudiences');
content = content.replace(/form\.ageMin/g, 'form.adSet.ageMin');
content = content.replace(/form\.ageMax/g, 'form.adSet.ageMax');
content = content.replace(/form\.gender( !== | === )/g, 'form.adSet.genders[0]$1');
content = content.replace(/form\.gender/g, 'form.adSet.genders[0]');
content = content.replace(/form\.placements/g, 'form.adSet.manualPlatforms');

content = content.replace(/form\.publishMode/g, 'form.ad.publishMode');
content = content.replace(/form\.adType/g, 'form.ad.format');
content = content.replace(/form\.adHeadline/g, '(form.ad.headlines[0] || "")');
content = content.replace(/form\.adText/g, '(form.ad.primaryTexts[0] || "")');
content = content.replace(/form\.description/g, '(form.ad.descriptions[0] || "")');
content = content.replace(/form\.ctaButton/g, 'form.ad.callToAction');
content = content.replace(/form\.adLink/g, 'form.ad.websiteUrl');
content = content.replace(/form\.videoUrl/g, '(form.ad.videos[0] || "")');
content = content.replace(/form\.imageUrl/g, '(form.ad.images[0] || "")');
content = content.replace(/form\.carouselCards/g, 'form.ad.carouselCards');
content = content.replace(/form\.adVariants/g, 'form.ad.adVariants');

fs.writeFileSync('src/features/meta/components/adsWizard/Step4Review.tsx', content);
console.log('Step 4 updated');
