const fs = require('fs');
const text = fs.readFileSync('scratch/dist_v79/dist/assets/LandingPage-Ct-R1CtO.js', 'utf8');
const strings = text.match(/"[A-Z][A-Za-z0-9 ,.!?]{20,}"/g);
if(strings) {
  console.log(strings.slice(0, 50).join('\n'));
} else {
  console.log("no strings found");
}
