import fs from 'fs';

let c = fs.readFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', 'utf-8');

c = c.replace(/const isVideo = form\.ad\.format === "VIDEO";/g, 'const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");\n  const isVideo = form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "VIDEO";');

c = c.replace(/onClick=\{\(\) => setForm\(\(f\) => \(\{ \.\.\.f, ad: \{ \.\.\.f\.ad, format: "SINGLE_IMAGE" \} \}\)\)\}/g, 'onClick={() => { setMediaType("IMAGE"); setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO" } })); }}');
c = c.replace(/onClick=\{\(\) => setForm\(\(f\) => \(\{ \.\.\.f, ad: \{ \.\.\.f\.ad, format: "VIDEO" \} \}\)\)\}/g, 'onClick={() => { setMediaType("VIDEO"); setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO" } })); }}');

c = c.replace(/form\.ad\.format === "SINGLE_IMAGE"/g, '(form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "IMAGE")');
c = c.replace(/form\.ad\.format === "VIDEO"/g, '(form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "VIDEO")');

// Replace value="SINGLE_IMAGE" and value="VIDEO" in AdTypeOption calls
// We can just leave their string literals since they're just strings to display?
// Wait, `value` expects "SINGLE_IMAGE_VIDEO" | "CAROUSEL" | "COLLECTION", so we need to suppress the type error.
c = c.replace(/<AdTypeOption\n\s+value="SINGLE_IMAGE"/g, '<AdTypeOption\n                value={"SINGLE_IMAGE_VIDEO" as any}');
c = c.replace(/<AdTypeOption\n\s+value="VIDEO"/g, '<AdTypeOption\n                value={"SINGLE_IMAGE_VIDEO" as any}');

// Also change `current={form.ad.format}` in those components so it highlights correctly.
c = c.replace(/current=\{form\.ad\.format\}\n\s+onClick=\{\(\) => \{\n\s+setMediaType\("IMAGE"\);/g, 'current={mediaType === "IMAGE" ? form.ad.format : "" as any}\n                onClick={() => {\n                  setMediaType("IMAGE");');
c = c.replace(/current=\{form\.ad\.format\}\n\s+onClick=\{\(\) => \{\n\s+setMediaType\("VIDEO"\);/g, 'current={mediaType === "VIDEO" ? form.ad.format : "" as any}\n                onClick={() => {\n                  setMediaType("VIDEO");');

fs.writeFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', c);
console.log('Done Step3Creative media type fix');
