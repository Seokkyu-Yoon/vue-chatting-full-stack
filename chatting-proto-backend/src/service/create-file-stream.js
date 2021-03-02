const PATH = require('path');
const mime = require('mime');
const fs = require('fs');

function createFileStream(id, filename) {
  const storage = PATH.join(process.cwd(), 'file_storage');
  const extension = filename.split('.').pop();
  const file = PATH.join(storage, `${id}.${extension}`);

  try {
    if (fs.existsSync(file)) {
      const mimetype = mime.getType(file);
      const filestream = fs.createReadStream(file);
      return { filestream, mimetype };
    } else {
      return new Error('File Download Error - No such file');
    }
  } catch (err) {
    console.log(err);
    return new Error('File Download Error - ', err.message);
  }
}

module.exports = createFileStream;