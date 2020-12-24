function Response (callback) {
  this.callback = callback
  this.code = 200
}
Response.prototype.status = function setStatus (code = 200) {
  this.code = code
  return this
}
Response.prototype.send = function send (body = {}) {
  this.callback({
    status: this.code,
    body
  })
}

export default Response
