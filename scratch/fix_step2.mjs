import fs from 'fs';

let content = fs.readFileSync('src/features/meta/components/adsWizard/Step2Audience.tsx', 'utf-8');

// Replacements for reading state
content = content.replace(/form\.ageMin/g, 'form.adSet.ageMin');
content = content.replace(/form\.ageMax/g, 'form.adSet.ageMax');
content = content.replace(/form\.gender( !== | === )/g, 'form.adSet.genders[0]$1');
content = content.replace(/form\.gender/g, 'form.adSet.genders[0]');
content = content.replace(/form\.locations/g, 'form.adSet.locations');
content = content.replace(/form\.interests/g, 'form.adSet.interests');
content = content.replace(/form\.detailedTargeting/g, 'form.adSet.detailedTargeting');
content = content.replace(/form\.customAudiences/g, 'form.adSet.customAudiences');
content = content.replace(/form\.placements/g, 'form.adSet.manualPlatforms');

// Replacements for updating state (customAudiences)
content = content.replace(/f\.customAudiences/g, 'f.adSet.customAudiences');
content = content.replace(/\{ \.\.\.f, customAudiences: (.*?) \}/g, '{ ...f, adSet: { ...f.adSet, customAudiences: $1 } }');
content = content.replace(/\.\.\.f,\n\s*customAudiences: /g, '...f,\n      adSet: { ...f.adSet, customAudiences: ');

// Replacements for updating state (detailedTargeting)
content = content.replace(/f\.detailedTargeting/g, 'f.adSet.detailedTargeting');
content = content.replace(/\{ \.\.\.f, detailedTargeting: (.*?) \}/g, '{ ...f, adSet: { ...f.adSet, detailedTargeting: $1 } }');
content = content.replace(/\.\.\.f,\n\s*detailedTargeting: /g, '...f,\n      adSet: { ...f.adSet, detailedTargeting: ');

// Replacements for updating state (locations)
content = content.replace(/f\.locations/g, 'f.adSet.locations');
content = content.replace(/\{ \.\.\.f, locations: (.*?) \}/g, '{ ...f, adSet: { ...f.adSet, locations: $1 } }');
content = content.replace(/\.\.\.f,\n\s*locations: /g, '...f,\n      adSet: { ...f.adSet, locations: ');

// Replacements for updating state (interests)
content = content.replace(/f\.interests/g, 'f.adSet.interests');
content = content.replace(/\{ \.\.\.f, interests: (.*?) \}/g, '{ ...f, adSet: { ...f.adSet, interests: $1 } }');
content = content.replace(/\.\.\.f,\n\s*interests: /g, '...f,\n      adSet: { ...f.adSet, interests: ');

// Replacements for updating state (placements)
content = content.replace(/f\.placements/g, 'f.adSet.manualPlatforms');
content = content.replace(/\{ \.\.\.f, placements: (.*?) \}/g, '{ ...f, adSet: { ...f.adSet, manualPlatforms: $1 } }');
content = content.replace(/\.\.\.f,\n\s*placements: /g, '...f,\n      adSet: { ...f.adSet, manualPlatforms: ');

// Replacements for updating state (age, gender)
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, ageMin:/g, 'setForm((f) => ({ ...f, adSet: { ...f.adSet, ageMin:');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, ageMax:/g, 'setForm((f) => ({ ...f, adSet: { ...f.adSet, ageMax:');
content = content.replace(/setForm\(\(f\) => \(\{ \.\.\.f, gender: /g, 'setForm((f) => ({ ...f, adSet: { ...f.adSet, genders: [');

content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*ageMin:/g, 'setForm((f) => ({\n                ...f,\n                adSet: { ...f.adSet, ageMin:');
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*ageMax:/g, 'setForm((f) => ({\n                ...f,\n                adSet: { ...f.adSet, ageMax:');
content = content.replace(/setForm\(\(f\) => \(\{\n\s*\.\.\.f,\n\s*gender:/g, 'setForm((f) => ({\n                ...f,\n                adSet: { ...f.adSet, genders: [');

// Fix multi-line map formatting missing closing brace in setForm
content = content.replace(/adSet: \{ \.\.\.f\.adSet, customAudiences: f\.adSet\.customAudiences\.map\(\(a\) =>\n(.*?)a\.id === id \? \{ \.\.\.a, excluded: !a\.excluded \} : a\n(.*)\),\n\s*\}\}\)/g, 'adSet: { ...f.adSet, customAudiences: f.adSet.customAudiences.map((a) => $1a.id === id ? { ...a, excluded: !a.excluded } : a$2) } })');
content = content.replace(/adSet: \{ \.\.\.f\.adSet, locations: f\.adSet\.locations\.map\(\(l\) =>\n(.*?)l\.key === key \? \{ \.\.\.l, excluded: !l\.excluded \} : l\n(.*)\),\n\s*\}\}\)/g, 'adSet: { ...f.adSet, locations: f.adSet.locations.map((l) => $1l.key === key ? { ...l, excluded: !l.excluded } : l$2) } })');
content = content.replace(/adSet: \{ \.\.\.f\.adSet, interests: f\.adSet\.interests\.map\(\(x\) =>\n(.*?)x\.id === id \? \{ \.\.\.x, excluded: !x\.excluded \} : x\n(.*)\),\n\s*\}\}\)/g, 'adSet: { ...f.adSet, interests: f.adSet.interests.map((x) => $1x.id === id ? { ...x, excluded: !x.excluded } : x$2) } })');

// Placements toggle
content = content.replace(/const existing = f\.adSet\.manualPlatforms\.includes\((.*?)\);\n\s*if \(existing\) \{\n\s*return \{ \.\.\.f, adSet: \{ \.\.\.f\.adSet, manualPlatforms: f\.adSet\.manualPlatforms\.filter\(\(p\) => p !== (.*?)\) \} \};\n\s*\}\n\s*return \{ \.\.\.f, adSet: \{ \.\.\.f\.adSet, manualPlatforms: \[\.\.\.f\.adSet\.manualPlatforms, (.*?)\] \} \};/g, 'const existing = f.adSet.manualPlatforms.includes($1);\n        if (existing) {\n          return { ...f, adSet: { ...f.adSet, manualPlatforms: f.adSet.manualPlatforms.filter((p) => p !== $2) } };\n        }\n        return { ...f, adSet: { ...f.adSet, manualPlatforms: [...f.adSet.manualPlatforms, $3] } };');

fs.writeFileSync('src/features/meta/components/adsWizard/Step2Audience.tsx', content);
console.log('Step 2 updated');
