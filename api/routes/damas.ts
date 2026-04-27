import { Router } from 'express'
import { postMoverBot, postMoverHumano, postNuevaPartida } from '../controllers/damasController'

const router = Router()

router.post('/nueva', postNuevaPartida)
router.post('/mover', postMoverHumano)
router.post('/bot/mover', postMoverBot)

export default router
