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

content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adText: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, primaryTexts: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, ctaButton: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, callToAction: $1 as any } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adHeadline: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, headlines: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, description: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, descriptions: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adLink: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, websiteUrl: $1 } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, videoUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, videos: [$1] } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, videoThumbnailUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, videoThumbnailUrl: $1 } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, captionsUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, captionsUrl: $1 } }))');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, imageUrl: (.*?) \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, images: [$1] } }))');

content = content.replace(/return \{ \.\.\.f, adVariants: next \};/g, 'return { ...f, ad: { ...f.ad, adVariants: next } };');
content = content.replace(/const next = \[\.\.\.f\.adVariants\];/g, 'const next = [...(f.ad.adVariants || [])];');
content = content.replace(/return \{ \.\.\.f, carouselCards: next \};/g, 'return { ...f, ad: { ...f.ad, carouselCards: next } };');
content = content.replace(/const next = \[\.\.\.f\.carouselCards\];/g, 'const next = [...(f.ad.carouselCards || [])];');

// Media types
content = content.replace(/const isVideo = form\.ad\.format === "VIDEO";/g, 'const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");\n  const isVideo = form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "VIDEO";');
content = content.replace(/onClick=\{\(\) => setForm\(\(f\) => \(\{ \.\.\.f, adType: "SINGLE_IMAGE" \}\)\)\}/g, 'onClick={() => { setMediaType("IMAGE"); setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO" } })); }}');
content = content.replace(/onClick=\{\(\) => setForm\(\(f\) => \(\{ \.\.\.f, adType: "VIDEO" \}\)\)\}/g, 'onClick={() => { setMediaType("VIDEO"); setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO" } })); }}');
content = content.replace(/onClick=\{\(\) => setForm\(\(f\) => \(\{ \.\.\.f, adType: "CAROUSEL" \}\)\)\}/g, 'onClick={() => setForm((f) => ({ ...f, ad: { ...f.ad, format: "CAROUSEL" } }))}');
content = content.replace(/onClick=\{\(\) => setForm\(\(f\) => \(\{ \.\.\.f, publishMode: "SINGLE_AD" \}\)\)\}/g, 'onClick={() => setForm((f) => ({ ...f, ad: { ...f.ad, publishMode: "SINGLE_AD" } }))}');
content = content.replace(/onClick=\{\(\) => setForm\(\(f\) => \(\{ \.\.\.f, publishMode: "AB_TEST" \}\)\)\}/g, 'onClick={() => setForm((f) => ({ ...f, ad: { ...f.ad, publishMode: "AB_TEST" } }))}');

content = content.replace(/form\.ad\.format === "SINGLE_IMAGE"/g, '(form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "IMAGE")');
content = content.replace(/form\.ad\.format === "VIDEO"/g, '(form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "VIDEO")');

// AdTypeOption overrides
content = content.replace(/<AdTypeOption\n\s+value="SINGLE_IMAGE"/g, '<AdTypeOption\n                value={"SINGLE_IMAGE_VIDEO" as any}');
content = content.replace(/<AdTypeOption\n\s+value="VIDEO"/g, '<AdTypeOption\n                value={"SINGLE_IMAGE_VIDEO" as any}');
content = content.replace(/current=\{form\.ad\.format\}\n\s+onClick=\{\(\) => \{\n\s+setMediaType\("IMAGE"\);/g, 'current={mediaType === "IMAGE" ? form.ad.format : "" as any}\n                onClick={() => {\n                  setMediaType("IMAGE");');
content = content.replace(/current=\{form\.ad\.format\}\n\s+onClick=\{\(\) => \{\n\s+setMediaType\("VIDEO"\);/g, 'current={mediaType === "VIDEO" ? form.ad.format : "" as any}\n                onClick={() => {\n                  setMediaType("VIDEO");');

// Use effect objects
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*carouselCards: /g, 'setForm((f) => ({\n      ...f,\n      ad: { ...f.ad, carouselCards: ');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, adVariants: /g, 'setForm((f) => ({ ...f, ad: { ...f.ad, adVariants: ');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, imageUrl: "", carouselCards: \[\] \}\)\)/g, 'setForm((f) => ({ ...f, ad: { ...f.ad, images: [""], carouselCards: [] } }))');

fs.writeFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', content);
console.log('Done script');
