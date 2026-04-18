
const fs = require("fs");
const spec = JSON.parse(fs.readFileSync("rwashin_api_specification.json", "utf-8"));

const domains = {};
spec.endpoints.forEach(ep => {
  const method = ep.method.toUpperCase();
  const path = ep.path;
  const tags = ep.tags ? ep.tags[0] : "Other";
  
  if (!domains[tags]) domains[tags] = [];
  domains[tags].push(`${method} ${path}`);
});

console.log(JSON.stringify(domains, null, 2));

