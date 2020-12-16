const { EventEmitter } = require('events');
const fs = require('fs');

const queue = [];
const event = new EventEmitter();

let writting = false;
event.on('write', () => {
  if (writting) return;
  writting = true;
  while (queue.length > 0) {
    const { path, message = null } = queue.shift();
    const savedMessages = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : [];
    const messages = message === null ? savedMessages : [...savedMessages, message];
    fs.writeFileSync(path, JSON.stringify(messages, null, 2));
  }
  writting = false;
});

function allRooms(dirPath) {
  return fs.readdirSync(dirPath);
}

function get(path) {
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : [];
}

function push(path, message) {
  queue.push({ path, message });
  event.emit('write');
}

module.exports = {
  allRooms,
  get,
  push,
};