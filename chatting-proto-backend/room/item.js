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

function Item(key, name) {
  this.key = key;
  this.name = name;
  this.messages = [];
  this.socketIds = [];
  this.lastUpdated = new Date();
  this.lastUpdated.setDate(0);
}
Item.prototype.write = function write(message) {
  this.checkLastUpdated();
  const now = new Date();
  const time = getFormattedTime(now);
  this.messages.push({ type: 'message', ...message, time });
  this.lastUpdated = now;
};
Item.prototype.join = function join(socketId, userName) {
  this.checkLastUpdated();
  const now = new Date();
  this.messages.push({ type: 'join', userName });
  this.socketIds.push(socketId);
  this.lastUpdated = now;
};
Item.prototype.leave = function leave(socketId, userName) {
  this.checkLastUpdated();
  const now = new Date();
  this.messages.push({ type: 'leave', userName });
  const socketIdIndex = this.socketIds.findIndex((value) => value === socketId);
  if (socketIdIndex > -1) {
    this.socketIds = [
      ...this.socketIds.slice(0, socketIdIndex),
      ...this.socketIds.slice(socketIdIndex + 1),
    ];
  }
  this.lastUpdated = now;
};
Item.prototype.checkLastUpdated = function checkLastUpdated() {
  const now = new Date();
  if (isAnotherDate(now, this.lastUpdated)) {
    this.messages.push({ type: 'time', ...extractDate(now) });
  }
};

module.exports = Item;
