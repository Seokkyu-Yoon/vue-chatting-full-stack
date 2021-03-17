import mysql from 'mysql'

import { ConfigMysql } from '@/config'

function rollback (connection) {
  return new Promise((resolve, reject) => {
    connection.rollback((err) => {
      return err ? reject(err) : resolve()
    })
  })
}

function commit (connection) {
  return new Promise((resolve, reject) => {
    connection.commit((err) => {
      return err ? reject(err) : resolve()
    })
  })
}

function query (connection, sql = '', params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      return err ? reject(err) : resolve(result)
    })
  })
}

function transaction (connection, sqlParamSets = []) {
  return new Promise((resolve, reject) => {
    connection.beginTransaction(async (err) => {
      if (err) return reject(err)

      try {
        const results = []
        for (const { sql, params } of sqlParamSets) {
          const result = await query(connection, sql, params)
          results.push(result)
        }
        await commit(connection)
        resolve(results)
      } catch (e) {
        await rollback(connection)
        return reject(e)
      }
    })
  })
}
class Connection {
  constructor (config = ConfigMysql) {
    this.connection = mysql.createConnection(config)
    this.connection.connect()
  }

  async query ({ sql, params = [] }) {
    try {
      const result = await query(this.connection, sql, params)
      this.connection.end()
      return result
    } catch (e) {
      this.connection.end()
      throw new Error(e)
    }
  }

  async transaction (sqlParamSets = []) {
    try {
      const results = await transaction(this.connection, sqlParamSets)
      this.connection.end()
      return results
    } catch (e) {
      this.connection.end()
      throw new Error(e)
    }
  }
}

export default Connection
