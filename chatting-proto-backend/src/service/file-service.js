const createError = require('http-errors')
const schedule = require('node-schedule')
const iconvLite = require('iconv-lite')

const {
  uploadData, getList,
  findFile, expireFile,
  validateFile, checkDate
} = require('@/plugins/mysql/file_db/db-command')
const createFileStream = require('./create-file-stream')

function getDownloadFilename (req, filename) {
  const header = req.headers['user-agent']

  if (header.includes('MSIE') || header.includes('Trident')) {
    return encodeURIComponent(filename).replace(/\\+/gi, '%20')
  } else if (header.includes('Chrome')) {
    return iconvLite.decode(iconvLite.encode(filename, 'UTF-8'), 'ISO-8859-1')
  } else if (header.includes('Opera')) {
    return iconvLite.decode(iconvLite.encode(filename, 'UTF-8'), 'ISO-8859-1')
  } else if (header.includes('Firefox')) {
    return iconvLite.decode(iconvLite.encode(filename, 'UTF-8'), 'ISO-8859-1')
  }

  return filename
}

const checkExpireDate = schedule.scheduleJob('* * * 1 *', async (tstamp) => {
  console.log(tstamp)
  // try {
  //   const today = convertDate(new Date());
  //   const queryResult = await checkDate(today);
  //   console.log(queryResult);
  // } catch (err) {
  //   console.error(err.message);
  // }
})

function convertDate (date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

async function getFileList (req, res, next) {
  try {
    const queryResult = await getList(req.params.roomId)

    res.send({
      data: queryResult,
      decoded: req.decoded
    })
  } catch (err) {
    next(createError(500, err.message))
  }
}

async function upload (req, res, next) {
  const { originalname, filename, size } = req.file
  const id = filename.split('.')[0]
  const { passwd, expireDate, roomId, uploadUser, isProtected } = req.body
  const registerDate = convertDate(new Date())

  const uploadInfo = {
    id,
    filename: originalname,
    size,
    uploadUser,
    roomId,
    registerDate,
    expireDate: convertDate(new Date(expireDate)),
    isProtected,
    passwd
  }

  try {
    await uploadData(uploadInfo)
    const uploadResult = await getList(roomId, false, id)

    res.send({
      data: uploadResult[0],
      decoded: req.decoded
    })
  } catch (err) {
    next(createError(500, err.message))
  }
}

async function download (req, res, next) {
  const { id } = req.params

  try {
    const { filename, is_protected: isProtected } = (await findFile(id))[0]

    const { filestream, mimetype } = createFileStream(id, filename)
    res.setHeader('Content-disposition', 'attachment; filename=' + getDownloadFilename(req, filename))
    res.setHeader('Content-type', mimetype)

    if (isProtected) {
      // validate body
      if (!req.body.passwd) {
        res.redirect('/access' + '/?value=' + id)
        return
      }

      // validate result
      const queryResult = await validateFile(id, req.body.passwd)
      if (!queryResult.length) {
        res.redirect(`/access/?value=${id}&validate=1`)
        return
      }

      filestream.pipe(res)
    } else {
      filestream.pipe(res)
    }
  } catch (err) {
    next(createError(500, err.message))
  }
}

async function expire (req, res, next) {
  const { id } = req.params

  try {
    const queryResult = await expireFile(id)

    res.send({
      data: queryResult,
      decoded: req.decoded
    })
  } catch (err) {
    next(createError(500, err.message))
  }
}

module.exports = {
  upload,
  download,
  getFileList,
  expire
}
