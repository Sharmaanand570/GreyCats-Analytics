const fs = require('fs');
const data = fs.readFileSync('scratch/target_content.json', 'utf8');
const lines = data.split('\n').filter(l => l.trim().length > 0);
for(const line of lines) {
  try {
    const parsed = JSON.parse(line);
    if(parsed.tool_calls && parsed.tool_calls.length > 0) {
      console.log(Object.keys(parsed.tool_calls[0].args));
      console.log(parsed.tool_calls[0].args.TargetFile);
      // Let's just dump the args to a file to inspect them
      fs.writeFileSync('scratch/args_dump.json', JSON.stringify(parsed.tool_calls[0].args, null, 2));
      process.exit(0);
    }
  } catch(e) {}
}
