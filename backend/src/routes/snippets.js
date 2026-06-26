import { Router } from 'express'
import { createSnippet, getSnippets, getSnippet, updateSnippet, deleteSnippet } from '../controllers/snippetController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/', protect, createSnippet)
router.get('/', protect, getSnippets)
router.get('/:id', protect, getSnippet)
router.put('/:id', protect, updateSnippet)
router.delete('/:id', protect, deleteSnippet)

export default router