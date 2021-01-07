function Megaphone (eventType, emitter) {
  this.emitter = emitter
  this.eventType = eventType
  this.roomKey = null
  this.code = 200
}

Megaphone.prototype.to = function to (roomKey = null) {
  this.roomKey = roomKey
  return this
}
Megaphone.prototype.status = function status (code = 200) {
  this.code = code
  return this
}
Megaphone.prototype.send = function send (body = {}) {
  const mic = this.roomKey === null ? this.emitter.broadcast : this.emitter.to(this.roomKey)
  mic.emit(this.eventType, { status: this.code, body })
}

function MegaphoneFactory (emitter) {
  this.emitter = emitter
}
MegaphoneFactory.prototype.create = function create (eventType) {
  return new Megaphone(eventType, this.emitter)
}

export default MegaphoneFactory
