const fs = require('fs');
const landingPath = 'c:\\greycats\\greycats-analytics\\greycats-analytics-v1\\src\\pages\\LandingPage.tsx';
const oldFeaturesData = fs.readFileSync('scratch/restored_featuresData.tsx', 'utf8');
let landingStr = fs.readFileSync(landingPath, 'utf8');

const startMarker = 'const featuresData = [';
const endMarker = '];\n\nconst FeatureItem = ({ feature, index, isActive, setActiveIdx }';

const startIndex = landingStr.indexOf(startMarker);
const endIndex = landingStr.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = landingStr.substring(0, startIndex);
  const after = landingStr.substring(endIndex);
  // oldFeaturesData ends with '];' already.
  // Wait, let's just make sure we join them correctly.
  const newLandingStr = before + oldFeaturesData + '\n\n' + after.substring(3); // after starts with '];\n\nconst FeatureItem', so skip '];\n'
  fs.writeFileSync(landingPath, newLandingStr);
  console.log('Successfully reverted featuresData.');
} else {
  console.log('Markers not found!');
}
