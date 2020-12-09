const roomRootPath = `${__dirname}/../storage/rooms`;

function getFormattedTime(date) {
  let hours = date.getHours();
  let noonFlag = 'AM';
  if (hours > 12) {
    hours -= 12;
    noonFlag = 'PM';
  }
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${noonFlag} ${hours}:${minutes}`;
}

function extractDate(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
  };
}

function isAnotherDate(date1, date2) {
  const extract1 = extractDate(date1);
  const extract2 = extractDate(date2);
  if (extract1.year !== extract2.year) return true;
  if (extract1.month !== extract2.month) return true;
  if (extract1.date !== extract2.date) return true;
  return false;
}

function Room({
  roomKey,
  roomName,
  messages = [],
  tokens = [],
  lastUpdated = new Date(),
}) {
  if (messages.length === 0) {
    lastUpdated.setDate(0);
  }
  this.roomKey = roomKey;
  this.roomName = roomName;
  this.messages = messages;
  this.tokens = new Set(tokens);
  this.lastUpdated = new Date(lastUpdated);
}
Room.prototype.serialize = function serialize() {
  return {
    ...this,
    tokens: [...this.tokens],
  };
};
Room.prototype.getRoomPath = function getRoomPath() {
  return `${roomRootPath}/${this.roomKey}.json`;
};
Room.prototype.onMessage = function onMessage(message) {
  this.checkLastUpdated();
  const now = new Date();
  const time = getFormattedTime(now);
  this.messages.push({ type: 'message', ...message, time });
  this.lastUpdated = now;
};
Room.prototype.join = function join(token, userName) {
  this.checkLastUpdated();
  const now = new Date();
  this.messages.push({ type: 'join', userName, token });
  this.tokens.add(token);
  this.lastUpdated = now;
};
Room.prototype.leave = function leave(token, userName) {
  this.checkLastUpdated();
  const now = new Date();
  this.messages.push({ type: 'leave', userName, token });
  this.tokens.delete(token);
  this.lastUpdated = now;
};
Room.prototype.checkLastUpdated = function checkLastUpdated() {
  const now = new Date();
  if (isAnotherDate(now, this.lastUpdated)) {
    this.messages.push({ type: 'time', ...extractDate(now) });
  }
};

module.exports = Room;
