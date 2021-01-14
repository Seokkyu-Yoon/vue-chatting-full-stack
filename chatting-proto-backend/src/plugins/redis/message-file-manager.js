import { EventEmitter } from 'events'
import fs from 'fs'
import { ConfigMessages } from '@/config'

const queue = []
const event = new EventEmitter()

if (!fs.existsSync(ConfigMessages.path)) {
  fs.mkdirSync(ConfigMessages.path, { recursive: true })
}

let writting = false
event.on('write', () => {
  if (writting) return
  writting = true
  while (queue.length > 0) {
    const { path, message = null } = queue.shift()
    const savedMessages = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : []
    const messages = message === null ? savedMessages : [...savedMessages, message]
    fs.writeFileSync(path, JSON.stringify(messages, null, 2))
  }
  writting = false
})

function allRooms (dirPath) {
  return fs.readdirSync(dirPath)
}

function get (path) {
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : []
}

function push (path, message) {
  queue.push({ path, message })
  event.emit('write')
}

function remove (path) {
  fs.unlinkSync(path)
}

export default {
  allRooms,
  get,
  push,
  remove
}
