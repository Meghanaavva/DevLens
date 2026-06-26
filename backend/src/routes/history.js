import { Router } from 'express'
import { getHistory, clearHistory } from '../controllers/historyController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/', protect, getHistory)
router.delete('/', protect, clearHistory)

export default router