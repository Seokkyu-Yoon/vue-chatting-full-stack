function Res (callback) {
  this.callback = callback
  this.code = 200
}
Res.prototype.status = function setStatus (code = 200) {
  this.code = code
  return this
}
Res.prototype.send = function send (body = {}) {
  this.callback({
    status: this.code,
    body
  })
}

export default Res
