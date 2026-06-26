// src/routes/inspect.js
import { Router } from 'express'
import { protect as authenticate } from '../middleware/auth.js'
import { aiLimiter } from '../middleware/rateLimit.js'
import * as inspectCtrl from '../controllers/inspectController.js'

const router = Router()
router.use(authenticate)

router.post('/code', aiLimiter, inspectCtrl.inspectCode)
router.post('/url',  aiLimiter, inspectCtrl.inspectUrl)

export default router