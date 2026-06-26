// src/controllers/buildController.js
import { validationResult } from 'express-validator'
import { callAI } from '../services/aiService.js'

const BUILD_SYSTEM = `You are WebsiteOS — the world's best AI website generator. Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no explanation.`

export async function generate(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  const { prompt } = req.body
  try {
    const { content, model } = await callAI([
      { role: 'system', content: BUILD_SYSTEM },
      { role: 'user', content: prompt }
    ], 8000)

    return res.json({ code: content, model })
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
}

export async function explain(req, res) {
  const { code } = req.body
  try {
    const { content } = await callAI([
      { role: 'user', content: code }
    ], 3000)
    return res.json({ result: content })
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
}

export async function fix(req, res) {
  const { code, error: errorMsg } = req.body
  try {
    const { content } = await callAI([
      { role: 'user', content: `Fix this code. Error: ${errorMsg}\n\nCode:\n${code}\n\nReturn ONLY the fixed code.` }
    ], 3000)
    return res.json({ result: content })
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
}

export async function getBuild(req, res) {
  res.json({ message: 'ok' })
}