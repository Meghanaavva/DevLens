import { Router } from 'express'
import { getProfile, updateProfile, deleteAccount } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.delete('/account', protect, deleteAccount)

export default router