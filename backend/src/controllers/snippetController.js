import { v4 as uuidv4 } from 'uuid'

const snippets = []

export const createSnippet = (req, res) => {
  const { title, code, language, tags } = req.body
  if (!title || !code) return res.status(400).json({ error: 'Title and code required' })

  const snippet = { id: uuidv4(), userId: req.user.id, title, code, language, tags, createdAt: new Date() }
  snippets.push(snippet)
  res.status(201).json(snippet)
}

export const getSnippets = (req, res) => {
  const userSnippets = snippets.filter((s) => s.userId === req.user.id)
  res.json(userSnippets)
}

export const getSnippet = (req, res) => {
  const snippet = snippets.find((s) => s.id === req.params.id && s.userId === req.user.id)
  if (!snippet) return res.status(404).json({ error: 'Snippet not found' })
  res.json(snippet)
}

export const updateSnippet = (req, res) => {
  const idx = snippets.findIndex((s) => s.id === req.params.id && s.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Snippet not found' })

  snippets[idx] = { ...snippets[idx], ...req.body, updatedAt: new Date() }
  res.json(snippets[idx])
}

export const deleteSnippet = (req, res) => {
  const idx = snippets.findIndex((s) => s.id === req.params.id && s.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Snippet not found' })

  snippets.splice(idx, 1)
  res.json({ message: 'Snippet deleted' })
}