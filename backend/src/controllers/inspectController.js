// src/controllers/inspectController.js
import { callAIVision, callAI } from '../services/aiService.js'

export async function inspectCode(req, res) {
  const { base64, mimeType, prompt } = req.body
  if (!base64 || !mimeType) return res.status(400).json({ error: 'base64 and mimeType required' })

  try {
    const { content } = await callAIVision(base64, mimeType, prompt)
    return res.json({ result: content })
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
}

export async function inspectUrl(req, res) {
  const { url, prompt } = req.body
  if (!url) return res.status(400).json({ error: 'url required' })
  try {
    const { content } = await callAI([
      { role: 'user', content: `Analyse this URL and generate UI code: ${url}\n\n${prompt || ''}` }
    ], 4000)
    return res.json({ result: content })
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
}