const fs = require("fs");
const path = require("path");

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

(async () => {
  for await (const file of walk(`./states/`)) {
    console.log(file);
  }
})();
