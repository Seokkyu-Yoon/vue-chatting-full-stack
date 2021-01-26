const { dbQuery } = require('./db-query');

async function sendQuery(query) {
  try {
    const queryResult = await dbQuery(query);
    return queryResult;
  } catch (err) {
    return new Error('DB Query Error - ', err.message);
  }
}

async function checkDate(today) {
  console.log(today);
  const query = `UPDATE FileInfo SET state="expired" WHERE expire_date<="${today}" AND state="available"`;

  const queryResult = await sendQuery(query);
  return queryResult;
}

async function uploadData(uploadInfo) {
  const {
    id,
    filename,
    size,
    author,
    room,
    registerDate,
    expireDate,
    passwd,
  } = uploadInfo;
  const passwdOrNot = passwd === '' ? '"none"' : `CONCAT("*",UPPER(SHA1("${passwd}")))`
  const query = `INSERT INTO FileInfo (id, filename, size, author, room, register_date, expire_date, passwd, state) VALUES("${id}", "${filename}", "${size}", "${author}", "${room}", "${registerDate}", "${expireDate}", ${passwdOrNot}, "available")`;

  const queryResult = await sendQuery(query);
  return queryResult;
}

async function getList(room) {
  const query = `SELECT id, filename, size, register_date, expire_date, passwd FROM FileInfo WHERE room="${room}" AND state="available"`;

  const queryResult = await sendQuery(query);
  return queryResult;
}

async function findFile(id, passwd) {
  const passwdOrNot = passwd === 'none' ? '"none"' : `CONCAT("*",UPPER(SHA1("${passwd}")))`
  const query = `SELECT filename, passwd FROM FileInfo WHERE id="${id}" AND passwd=${passwdOrNot}`;

  const queryResult = await sendQuery(query);
  return queryResult;
}

async function expireFile(id) {
  const query = `UPDATE FileInfo SET state="expired" WHERE id="${id}"`;

  const queryResult = await sendQuery(query);
  return queryResult;
}

module.exports = {
  checkDate,
  uploadData,
  getList,
  findFile,
  expireFile
};