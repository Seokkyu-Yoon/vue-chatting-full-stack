const { dbQuery } = require('./db-query')

async function sendQuery (query) {
  try {
    const queryResult = await dbQuery(query)
    return queryResult
  } catch (err) {
    return new Error('DB Query Error - ', err.message)
  }
}

async function checkDate (today) {
  console.log(today)
  const query = `UPDATE FileInfo SET state="expired" WHERE expire_date<="${today}" AND state="available"`

  const queryResult = await sendQuery(query)
  return queryResult
}

async function uploadData (uploadInfo) {
  const {
    id,
    filename,
    size,
    uploadUser,
    roomId,
    registerDate,
    expireDate,
    isProtected,
    passwd
  } = uploadInfo
  const protectedPasswd = JSON.parse(isProtected) ? `CONCAT("*",UPPER(SHA1("${passwd}")))` : '""'
  const query = `INSERT INTO FileInfo (id, filename, size, upload_user, room_id, register_date, expire_date, is_protected, passwd, state) VALUES("${id}", "${filename}", "${size}", "${uploadUser}", "${roomId}", "${registerDate}", "${expireDate}", ${isProtected}, ${protectedPasswd}, "available")`

  const queryResult = await sendQuery(query)
  return queryResult
}

async function getList (roomId, entire = true, id) {
  const query = entire ? `SELECT id, filename, size, upload_user, register_date, expire_date, is_protected FROM FileInfo WHERE room_id="${roomId}" AND state="available"` : `SELECT id, filename, size, upload_user, register_date, expire_date, is_protected FROM FileInfo WHERE room_id="${roomId}" AND state="available" AND id="${id}"`

  const queryResult = await sendQuery(query)
  return queryResult
}

async function findFile (id) {
  const query = `SELECT filename, is_protected FROM FileInfo WHERE id="${id}"`

  const queryResult = await sendQuery(query)
  return queryResult
}

async function validateFile (id, passwd) {
  const query = `SELECT filename FROM FileInfo WHERE id="${id}" AND passwd=CONCAT("*",UPPER(SHA1("${passwd}")))`

  const queryResult = await sendQuery(query)
  return queryResult
}

async function expireFile (id) {
  const query = `UPDATE FileInfo SET state="expired" WHERE id="${id}"`

  const queryResult = await sendQuery(query)
  return queryResult
}

module.exports = {
  checkDate,
  uploadData,
  getList,
  findFile,
  validateFile,
  expireFile
}
