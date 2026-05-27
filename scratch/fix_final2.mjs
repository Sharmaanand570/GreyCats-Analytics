import fs from 'fs';

let t = fs.readFileSync('src/features/meta/components/adsWizard/types.ts', 'utf-8');
t = t.replace(/DestinationType\.WEBSITE/g, '"WEBSITE"');
t = t.replace(/AdFormat\.SINGLE_IMAGE_VIDEO/g, '"SINGLE_IMAGE_VIDEO"');
t = t.replace(/AdFormat\.CAROUSEL/g, '"CAROUSEL"');
fs.writeFileSync('src/features/meta/components/adsWizard/types.ts', t);

let s1 = fs.readFileSync('src/features/meta/components/adsWizard/Step1Settings.tsx', 'utf-8');
s1 = s1.replace(/const specialAdCategory = form\.campaign\.specialAdCategories\?\.\[0\] \|\| "NONE";/g, 'const specialAdCategory = form.campaign.specialAdCategories?.[0] || "NONE";');
fs.writeFileSync('src/features/meta/components/adsWizard/Step1Settings.tsx', s1);

let s3 = fs.readFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', 'utf-8');
s3 = s3.replace(/f\.carouselCards/g, 'f.ad.carouselCards');
s3 = s3.replace(/f\.adVariants/g, 'f.ad.adVariants');
s3 = s3.replace(/setForm\(\(f\) => \(\{ \.\.\.f, carouselCards/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, carouselCards');
s3 = s3.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adVariants/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, adVariants');
s3 = s3.replace(/value: AdType;/g, 'value: "SINGLE_IMAGE_VIDEO" | "CAROUSEL" | "COLLECTION" | "SINGLE_IMAGE" | "VIDEO";');
s3 = s3.replace(/imageUrl=\{(card\.imageUrl \|\| "")\}/g, 'imageUrl={card.imageUrl || ""}');
s3 = s3.replace(/imageUrl=\{card\.imageUrl\}/g, 'imageUrl={card.imageUrl || ""}');
s3 = s3.replace(/imageUrl=\{v\.imageUrl\}/g, 'imageUrl={v.imageUrl || ""}');
s3 = s3.replace(/captionsUrl=\{form\.ad\.captionsUrl\}/g, 'captionsUrl={form.ad.captionsUrl || ""}');
s3 = s3.replace(/videoThumbnailUrl=\{form\.ad\.videoThumbnailUrl\}/g, 'imageUrl={form.ad.videoThumbnailUrl || ""}');
s3 = s3.replace(/imageUrl=\{form\.ad\.videoThumbnailUrl\}/g, 'imageUrl={form.ad.videoThumbnailUrl || ""}');
s3 = s3.replace(/captionsUrl=\{form\.ad\.captionsUrl\}/g, 'captionsUrl={form.ad.captionsUrl || ""}');
fs.writeFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', s3);

let s4 = fs.readFileSync('src/features/meta/components/adsWizard/Step4Review.tsx', 'utf-8');
s4 = s4.replace(/form\.videoThumbnailUrl/g, 'form.ad.videoThumbnailUrl');
s4 = s4.replace(/form\.captionsUrl/g, 'form.ad.captionsUrl');
s4 = s4.replace(/AdFormat\.SINGLE_IMAGE_VIDEO/g, '"SINGLE_IMAGE_VIDEO"');
s4 = s4.replace(/AdFormat\.CAROUSEL/g, '"CAROUSEL"');
s4 = s4.replace(/AdFormat\.COLLECTION/g, '"COLLECTION"');
s4 = s4.replace(/=== "VIDEO"/g, '=== "SINGLE_IMAGE_VIDEO"'); // We will just check SINGLE_IMAGE_VIDEO and videos.length
s4 = s4.replace(/=== "SINGLE_IMAGE"/g, '=== "SINGLE_IMAGE_VIDEO"');
fs.writeFileSync('src/features/meta/components/adsWizard/Step4Review.tsx', s4);

let mw = fs.readFileSync('src/pages/MetaAdsWizardPage.tsx', 'utf-8');
mw = mw.replace(/useCampaignDetails/g, 'useMetaAdsDetail');
fs.writeFileSync('src/pages/MetaAdsWizardPage.tsx', mw);

console.log("Done final");
