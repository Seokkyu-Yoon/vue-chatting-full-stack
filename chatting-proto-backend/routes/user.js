const express = require('express');
const userManager = require('../user');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const { socketId } = req.params;
  if (socketId) {
    res.json(userManager.userMap[socketId]);
  }
  const enteredusers = Object.keys(userManager.userMap).reduce((bucket, socketId) => {
    if (userManager.userMap[socketId].name === '') return bucket;
    bucket[socketId] = userManager.userMap[socketId];
    return bucket;
  }, {});
  res.json(enteredusers);
});

router.get('/exists', (req, res, next) => {
  const { socketId } = req.query;
  res.json(
    (typeof userManager.userMap[socketId] !== 'undefined')
    && (userManager.userMap[socketId].name !== ''),
  );
});

module.exports = router;
