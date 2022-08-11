const fs = require('fs');
const template = require('../package-template.json');
const { version } = require('../package.json');

template.version = version;

fs.writeFileSync('../package.json', JSON.stringify(template));
