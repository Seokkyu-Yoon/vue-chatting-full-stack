const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const injectedEnv = process.env
const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')))
process.env.VUE_APP_SERVER_PROTOCOL = injectedEnv.SERVER_PROTOCOL || env.SERVER_PROTOCOL
process.env.VUE_APP_SERVER_IP = injectedEnv.SERVER_IP || env.SERVER_IP
process.env.VUE_APP_SERVER_PORT = injectedEnv.SERVER_PORT || env.SERVER_PORT

module.exports = {}
