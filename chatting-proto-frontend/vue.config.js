const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')))
process.env.VUE_APP_SERVER_PORT = env.SERVER_PORT

module.exports = {}
