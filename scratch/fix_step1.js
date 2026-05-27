const fs = require('fs');

let content = fs.readFileSync('src/features/meta/components/adsWizard/Step1Settings.tsx', 'utf-8');

// Replacements
content = content.replace(/form\.objective/g, 'form.campaign.objective');
content = content.replace(/form\.pixelId/g, 'form.adSet.pixelId');
content = content.replace(/form\.conversionEvent/g, 'form.adSet.conversionEvent');
content = content.replace(/form\.accountId/g, 'form.campaign.accountId');
content = content.replace(/form\.pageId/g, 'form.campaign.pageId');
content = content.replace(/form\.campaignName/g, 'form.campaign.name');

content = content.replace(/form\.budgetType === "DAILY"/g, '(form.campaign.isCboEnabled ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY")) === "DAILY"');
content = content.replace(/form\.budgetType === "LIFETIME"/g, '(form.campaign.isCboEnabled ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY")) === "LIFETIME"');
content = content.replace(/form\.budgetType/g, '(form.campaign.isCboEnabled ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY"))');

content = content.replace(/form\.dailyBudget/g, '(form.campaign.isCboEnabled ? form.campaign.dailyBudget : form.adSet.dailyBudget)');
content = content.replace(/form\.lifetimeBudget/g, '(form.campaign.isCboEnabled ? form.campaign.lifetimeBudget : form.adSet.lifetimeBudget)');

content = content.replace(/form\.startTime/g, 'form.adSet.scheduleStart');
content = content.replace(/form\.endTime/g, 'form.adSet.scheduleEnd');
content = content.replace(/form\.specialAdCategory/g, '(form.campaign.specialAdCategories?.[0] || "NONE")');

// setForm replacements
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, accountId/g, 'setForm((f) => ({ ...f, campaign: { ...f.campaign, accountId');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, pageId/g, 'setForm((f) => ({ ...f, campaign: { ...f.campaign, pageId');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, pixelId: "", conversionEvent: "" \}\)/g, 'setForm((f) => ({ ...f, adSet: { ...f.adSet, pixelId: "", conversionEvent: "" } })');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, pixelId/g, 'setForm((f) => ({ ...f, adSet: { ...f.adSet, pixelId');

// Specific setForm blocks
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*campaignName: e\.target\.value,\n\s*\}\)\)/g, 'setForm((f) => ({\n                ...f,\n                campaign: { ...f.campaign, name: e.target.value },\n              }))');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*specialAdCategory: v as SpecialAdCategory,\n\s*\}\)\)/g, 'setForm((f) => ({\n                ...f,\n                campaign: { ...f.campaign, specialAdCategories: v === "NONE" ? [] : [v as SpecialAdCategory] },\n              }))');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*objective: v as CampaignObjective,\n\s*\}\)\)/g, 'setForm((f) => ({\n                      ...f,\n                      campaign: { ...f.campaign, objective: v as CampaignObjective },\n                    }))');

// Budget updates
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*budgetType: v,\n\s*\}\)\)/g, 'setForm((f) => {\n                  const isCbo = f.campaign.isCboEnabled;\n                  if (isCbo) {\n                    return { ...f, campaign: { ...f.campaign, lifetimeBudget: v === "LIFETIME" ? (f.campaign.dailyBudget || 20) * 7 : undefined, dailyBudget: v === "DAILY" ? (f.campaign.lifetimeBudget || 140) / 7 : undefined } };\n                  } else {\n                    return { ...f, adSet: { ...f.adSet, lifetimeBudget: v === "LIFETIME" ? (f.adSet.dailyBudget || 20) * 7 : undefined, dailyBudget: v === "DAILY" ? (f.adSet.lifetimeBudget || 140) / 7 : undefined } };\n                  }\n                })');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*\[budgetType === "DAILY" \? "dailyBudget" : "lifetimeBudget"\]: val,\n\s*\}\)\)/g, 'setForm((f) => {\n                      const isCbo = f.campaign.isCboEnabled;\n                      const field = (isCbo ? (f.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (f.adSet.lifetimeBudget ? "LIFETIME" : "DAILY")) === "DAILY" ? "dailyBudget" : "lifetimeBudget";\n                      if (isCbo) {\n                        return { ...f, campaign: { ...f.campaign, [field]: val } };\n                      } else {\n                        return { ...f, adSet: { ...f.adSet, [field]: val } };\n                      }\n                    })');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*startTime: e\.target\.value,\n\s*\}\)\)/g, 'setForm((f) => ({\n                      ...f,\n                      adSet: { ...f.adSet, scheduleStart: e.target.value },\n                    }))');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*endTime: e\.target\.value,\n\s*\}\)\)/g, 'setForm((f) => ({\n                      ...f,\n                      adSet: { ...f.adSet, scheduleEnd: e.target.value },\n                    }))');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*conversionEvent: v as ConversionEvent,\n\s*\}\)\)/g, 'setForm((f) => ({\n                      ...f,\n                      adSet: { ...f.adSet, conversionEvent: v as ConversionEvent },\n                    }))');

fs.writeFileSync('src/features/meta/components/adsWizard/Step1Settings.tsx', content);
console.log('Step 1 updated');
