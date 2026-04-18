
const fs = require("fs");
const path = require("path");

const rules = JSON.parse(fs.readFileSync("rwashin_validation_rules.json", "utf8"));

function typeToZod(fieldConfig) {
  let zType = "z.any()";
  const { type, required, pattern, format } = fieldConfig;
  
  let types = Array.isArray(type) ? type : [type];
  let isNull = types.includes("null");
  types = types.filter(t => t !== "null");
  
  if (types.includes("string")) {
    if (format === "uuid") zType = "z.string().uuid()";
    else if (format === "date-time") zType = "z.string().datetime()";
    else zType = "z.string()";
    
    if (pattern) {
      // z.string().regex(/pattern/)
      zType += `.regex(/${pattern}/)`;
    }
  } else if (types.includes("integer") || types.includes("number")) {
    zType = "z.number()";
  } else if (types.includes("boolean")) {
    zType = "z.boolean()";
  } else if (types.includes("array")) {
    zType = "z.array(z.any())";
  }

  if (isNull) {
    zType += ".nullable()";
  }
  if (!required) {
    zType += ".optional()";
  }
  
  return zType;
}

function generateZodSchema(modelName, modelDef) {
  const fields = Object.entries(modelDef.fields || {}).map(([key, config]) => {
    return `  ${key}: ${typeToZod(config)},`;
  }).join("\n");
  
  return `export const ${modelName}Schema = z.object({\n${fields}\n});\nexport type ${modelName} = z.infer<typeof ${modelName}Schema>;\n`;
}

const targets = ["RegisterRequest", "ClientUpdateRequest"];
let output = `import { z } from "zod";\n\n`;

targets.forEach(t => {
  if (rules[t]) {
    output += generateZodSchema(t, rules[t]) + "\n";
  }
});

fs.writeFileSync("src/schemas/generated/clients.schema.ts", output);
console.log("Written to src/schemas/generated/clients.schema.ts");

