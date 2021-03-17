import Connection from './connection'
import { ConfigMysql } from '../../config'

async function initDatabase () {
  const connection = new Connection({ ...ConfigMysql, database: undefined })
  await connection.query({
    sql: `CREATE DATABASE IF NOT EXISTS ${ConfigMysql.database}`,
    params: []
  })
}

export default initDatabase
