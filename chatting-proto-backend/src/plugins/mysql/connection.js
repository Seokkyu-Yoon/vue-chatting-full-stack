import mysql from 'mysql'

import { ConfigMysql } from '@/config'

function Connection () {
  this.connection = mysql.createConnection(ConfigMysql)
  this.connection.connect()
}

function query ({ connection, sql = '', params = [] }) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      return err ? reject(err) : resolve(result)
    })
  })
}

function transaction ({ connection, sqlParamSets = [] }) {
  return new Promise((resolve, reject) => {
    connection.beginTransaction(async (errBeginTransaction) => {
      try {
        const results = await Promise.all(sqlParamSets.map(({ sql, params }) => query({ connection, sql, params })))
        connection.commit((errCommit) => {
          if (errCommit) {
            connection.rollback()
            return reject(errCommit)
          }
          return resolve(results)
        })
      } catch (e) {
        connection.rollback()
        return reject(e)
      }

      if (errBeginTransaction) {
        connection.rollback()
        return reject(errBeginTransaction)
      }
    })
  })
}
Connection.prototype.query = async function ({ sql = '', params = [] }) {
  const result = await query({
    connection: this.connection,
    sql,
    params
  })
  this.connection.end()
  return result
}

Connection.prototype.transaction = async function (sqlParamSets) {
  const results = await transaction({
    connection: this.connection,
    sqlParamSets
  })
  this.connection.end()
  return results
}

export default Connection
