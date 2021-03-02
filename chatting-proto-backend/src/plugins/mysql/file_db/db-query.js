const mysql = require('mysql')
const { filedbAccessInfo } = require('@/config')
const { log } = console

const pool = mysql.createPool(filedbAccessInfo)

function dbQuery (query) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        log('Error in connection database: ' + err)
        reject({ code: 100, status: 'Error in connection database' })
      } else {
        // Use the connection
        connection.query(query, (err, rows) => {
          // And done with the connection.
          connection.release()

          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          // Don't use the connection here, it has been returned to the pool.
        })
      }
    })
  })
}

module.exports = {
  dbQuery
}
