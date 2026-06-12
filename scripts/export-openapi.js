const fs = require('fs');
const path = require('path');
const swaggerSpec = require('../src/config/swagger');

const outPath = path.join(__dirname, '..', 'openapi.json');
fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`OpenAPI spec written to ${outPath}`);
