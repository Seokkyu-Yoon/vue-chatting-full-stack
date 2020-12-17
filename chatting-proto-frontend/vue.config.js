const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync(`${__dirname}/../.env`));
process.env.VUE_APP_SERVER_PORT = env.SERVER_PORT;

module.exports = {};
