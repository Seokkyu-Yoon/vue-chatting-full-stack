import { Router } from 'express'

import mysql from '../../../plugins/mysql'

const router = Router()

router.get('/', async (req, res, next) => {
  const {
    roomId = null
  } = req.query

  const result = await mysql.getUsers({ roomId })
  res.send(result)
})

export default router
