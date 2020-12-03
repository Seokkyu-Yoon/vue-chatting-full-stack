const express = require('express');
const roomManager = require('../room');
const plugins = require('../plugin');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const { roomKey } = req.query || {};
  if (roomKey) {
    res.json(roomManager.roomMap[roomKey]);
    return;
  }
  res.json(roomManager.roomMap);
});

router.put('/', (req, res, next) => {
  const {
    roomName,
  } = req.body;
  roomManager.create(roomName);
  plugins.socket.onRoomsChanged();
  res.json({});
});

module.exports = router;
