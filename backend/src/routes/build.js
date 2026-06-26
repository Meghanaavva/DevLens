// src/routes/build.js  — add these routes to your existing file
import { Router } from 'express'
import { body } from 'express-validator'
import { protect as authenticate } from '../middleware/auth.js'
import { aiLimiter } from '../middleware/rateLimit.js'
import * as buildCtrl from '../controllers/buildController.js'

const router = Router()
router.use(authenticate)

router.post('/generate', aiLimiter,
  [body('prompt').trim().notEmpty()],
  buildCtrl.generate
)
router.post('/explain', aiLimiter,
  [body('code').notEmpty()],
  buildCtrl.explain
)
router.post('/fix', aiLimiter,
  [body('code').notEmpty(), body('error').notEmpty()],
  buildCtrl.fix
)
router.get('/:id', buildCtrl.getBuild)

export default router