const express = require('express');
const multer = require('multer');
const PATH = require('path');
const uuid = require('uuid').v4;
const fileService = require('@/service/file-service');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PATH.join(process.cwd(), 'file_storage')),
  filename: (req, file, cb) => {
    const oName = file.originalname.split('.');
    const rename = `${uuid()}.${oName[oName.length - 1]}`
    cb(null, rename);
    // cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/* GET upload listing. */
router.post('/upload', upload.single('upFile'), fileService.upload);

router.post('/download/:id', fileService.download);

router.get('/list/:room', fileService.getFileList);

router.delete('/delete/:id', fileService.expire);

module.exports = router;
