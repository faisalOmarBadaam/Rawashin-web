const fs = require("fs");
const path = require("path");

function walkSync(dir, filelist = []) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        filelist = walkSync(fullPath, filelist);
      } else {
        filelist.push(fullPath);
      }
    });
  }
  return filelist;
}

const exts = [".ts", ".tsx"];
const allFiles = walkSync("src").filter(f => exts.includes(path.extname(f)));

let contexts = 0;
let zustand = 0;
let reactQuery = 0;
let legacyFiles = 0;
let modernFiles = 0;
const domainDirs = new Set();
const apiFiles = [];

allFiles.forEach(f => {
  const content = fs.readFileSync(f, "utf-8");
  if (f.includes("@core") || f.includes("@layouts")) legacyFiles++;
  if (f.includes("modules") || f.includes("core\\")) modernFiles++;
  if (content.includes("createContext") || content.includes("useContext")) contexts++;
  if (content.includes("zustand")) zustand++;
  if (content.includes("useQuery") || content.includes("useMutation")) reactQuery++;
  
  if (f.includes("modules\\")) {
    const parts = f.split("\\");
    const modIdx = parts.indexOf("modules");
    if (modIdx !== -1 && parts[modIdx+1]) domainDirs.add(parts[modIdx+1]);
  }
  
  if (f.endsWith("api.ts") || f.includes("service.ts")) apiFiles.push(f);
});

console.log(JSON.stringify({
  totalCodeFiles: allFiles.length,
  legacyFiles,
  modernFiles,
  contextsUsed: contexts,
  zustandUsed: zustand,
  reactQueryUsed: reactQuery,
  domains: Array.from(domainDirs),
  apiFilesCount: apiFiles.length
}, null, 2));
