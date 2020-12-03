const PluginSocketIo = require('./socket-io');

const plugins = {
  socket: new PluginSocketIo(),
};

module.exports = plugins;
