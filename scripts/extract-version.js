const fs = require('fs');

const env = `export const version = '${process.env.npm_package_version}';\n`;
fs.writeFileSync('src/environments/.version.ts', env)
