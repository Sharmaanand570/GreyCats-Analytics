import fs from 'fs';
let c = fs.readFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', 'utf-8');
c = c.replace(/adVariants: \[blankVariant\(\), blankVariant\(\)\] \}\)\);/g, 'adVariants: [blankVariant(), blankVariant()] } }));');
c = c.replace(/carouselCards: \[blankCarouselCard\(\), blankCarouselCard\(\)\] \}\)\);/g, 'carouselCards: [blankCarouselCard(), blankCarouselCard()] } }));');
c = c.replace(/images: \[""\], carouselCards: \[\] \}\)\);/g, 'images: [""], carouselCards: [] } }));');
fs.writeFileSync('src/features/meta/components/adsWizard/Step3Creative.tsx', c);
console.log('Fixed braces');
