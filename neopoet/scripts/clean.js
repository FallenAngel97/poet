const fs = require('fs');
const template = require('../package-template.json');
const { version } = require('../package.json');

template.version = version;

console.log('Overriding package.json...');
fs.writeFileSync('../package.json', JSON.stringify(template));
