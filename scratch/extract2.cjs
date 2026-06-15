const fs = require('fs');
const data = fs.readFileSync('scratch/target_content.json', 'utf8');
const match = data.match(/"TargetContent":"(const featuresData = [\s\S]*?)","TargetFile"/);
if (match) {
  let content = match[1];
  // The string is JSON encoded, so it has escaped newlines like \n and escaped quotes like \".
  // We can just parse it as JSON to unescape it.
  content = JSON.parse('"' + content + '"');
  fs.writeFileSync('scratch/restored_featuresData.tsx', content);
  console.log('Done');
} else {
  console.log('Not found');
}
