import fs from 'fs';

let content = fs.readFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', 'utf-8');

// Replacements
content = content.replace(/form\.publishMode/g, 'form.ad.publishMode');
content = content.replace(/form\.adType/g, 'form.ad.format');
content = content.replace(/form\.adText/g, '(form.ad.primaryTexts[0] || "")');
content = content.replace(/form\.ctaButton/g, 'form.ad.callToAction');
content = content.replace(/form\.adHeadline/g, '(form.ad.headlines[0] || "")');
content = content.replace(/form\.description/g, '(form.ad.descriptions[0] || "")');
content = content.replace(/form\.adLink/g, 'form.ad.websiteUrl');
content = content.replace(/form\.videoUrl/g, '(form.ad.videos[0] || "")');
content = content.replace(/form\.videoThumbnailUrl/g, 'form.ad.videoThumbnailUrl');
content = content.replace(/form\.captionsUrl/g, 'form.ad.captionsUrl');
content = content.replace(/form\.imageUrl/g, '(form.ad.images[0] || "")');
content = content.replace(/form\.carouselCards/g, 'form.ad.carouselCards');
content = content.replace(/form\.adVariants/g, 'form.ad.adVariants');

// setForm replacements
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adText: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, primaryTexts: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, ctaButton: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, callToAction: $1 as any } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adHeadline: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, headlines: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, description: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, descriptions: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adLink: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, websiteUrl: $1 } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, videoUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, videos: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, videoThumbnailUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, videoThumbnailUrl: $1 } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, captionsUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, captionsUrl: $1 } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, imageUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, images: [$1] } }))');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*publishMode: /g, 'setForm((f) => ({\n      ...f,\n      ad: { ...f.ad, publishMode: ');
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*adType: /g, 'setForm((f) => ({\n      ...f,\n      ad: { ...f.ad, format: ');
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*carouselCards: /g, 'setForm((f) => ({\n      ...f,\n      ad: { ...f.ad, carouselCards: ');
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*adVariants: /g, 'setForm((f) => ({\n      ...f,\n      ad: { ...f.ad, adVariants: ');

// adVariants update mapping
content = content.replace(/return \{ \.\.\.f, adVariants: next \};/g, 'return { ...f, ad: { ...f.ad, adVariants: next } };');
content = content.replace(/const next = \[\.\.\.f\.adVariants\];/g, 'const next = [...(f.ad.adVariants || [])];');
content = content.replace(/return \{ \.\.\.f, carouselCards: next \};/g, 'return { ...f, ad: { ...f.ad, carouselCards: next } };');
content = content.replace(/const next = \[\.\.\.f\.carouselCards\];/g, 'const next = [...(f.ad.carouselCards || [])];');

// The line `setForm((f) => ({ ...f, carouselCards: next }))` might also exist
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*carouselCards: /g, 'setForm((f) => ({\n      ...f,\n      ad: { ...f.ad, carouselCards: ');

fs.writeFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', content);
console.log('Step 3 updated');
