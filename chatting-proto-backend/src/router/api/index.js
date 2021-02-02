import { Router } from 'express'

import routerUser from './user'
import routerRoom from './room'

const router = Router()

router.use('/room', routerRoom)
router.use('/user', routerUser)

export default router
