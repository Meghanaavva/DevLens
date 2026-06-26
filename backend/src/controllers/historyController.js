import { v4 as uuidv4 } from 'uuid'

const history = []

export const addHistory = (userId, type, data) => {
  history.push({ id: uuidv4(), userId, type, data, createdAt: new Date() })
}

export const getHistory = (req, res) => {
  const userHistory = history
    .filter((h) => h.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50)
  res.json(userHistory)
}

export const clearHistory = (req, res) => {
  const before = history.length
  history.splice(0, history.length, ...history.filter((h) => h.userId !== req.user.id))
  res.json({ message: `Cleared ${before - history.length} entries` })
}