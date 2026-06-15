const fs = require('fs');
const code = fs.readFileSync('c:/greycats/greycats-analytics/greycats-analytics-v1/scratch/v79_real_extract/dist/assets/index-BkgjLZi1.js', 'utf8');

const regex = /title:"([^"]+)",desc:"([^"]+)"/g;
let match;
while ((match = regex.exec(code)) !== null) {
    if (['Analytics', 'Reports', 'SEO Tools', 'Scheduler', 'Broadcast'].includes(match[1])) {
        console.log(match[1] + ' : ' + match[2]);
    }
}
