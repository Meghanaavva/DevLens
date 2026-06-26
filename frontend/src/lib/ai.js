const OR_KEY = import.meta.env.VITE_OPENROUTER_KEY || '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'
const OR_BASE = 'https://openrouter.ai/api/v1/chat/completions'

// Hardcoded fallback list — updated June 2026
const FALLBACK_MODELS = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3-coder:free',
]

// Fetch live free models from OpenRouter API — always up to date
let cachedFreeModels = null
async function getFreeModels() {
  if (cachedFreeModels) return cachedFreeModels
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${OR_KEY}` }
    })
    const data = await res.json()
    if (!data.data) throw new Error('No models returned')

    // Filter: text output, $0 pricing, not safety/audio/image models
    const free = data.data
      .filter(m =>
        m.pricing?.completion === '0' &&
        m.pricing?.prompt === '0' &&
        m.architecture?.output_modalities?.includes('text') &&
        !m.id.includes('safety') &&
        !m.id.includes('tts') &&
        !m.id.includes('whisper') &&
        !m.id.includes('image') &&
        (m.context_length || 0) >= 32000
      )
      .sort((a, b) => (b.context_length || 0) - (a.context_length || 0))
      .map(m => m.id)

    console.log(`✅ Found ${free.length} free models:`, free.slice(0, 6))
    cachedFreeModels = free.length > 0 ? free : FALLBACK_MODELS
    return cachedFreeModels
  } catch (e) {
    console.warn('Could not fetch live models, using fallback list:', e.message)
    return FALLBACK_MODELS
  }
}

async function fetchWithTimeout(url, options, timeoutMs = 90000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch (e) {
    clearTimeout(timer)
    if (e.name === 'AbortError') throw new Error('Timed out after 90s')
    throw e
  }
}

async function orCall(model, messages, maxTokens) {
  console.log(`→ Trying ${model}...`)
  const res = await fetchWithTimeout(OR_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OR_KEY}`,
      'HTTP-Referer': 'https://devlens.app',
      'X-Title': 'DevLens AI Builder',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.85, messages }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`${res.status}: ${data.error.message || JSON.stringify(data.error)}`)
  const content = data.choices?.[0]?.message?.content || ''
  if (!content) throw new Error('Empty response')
  console.log(`✅ ${model} → ${content.length} chars`)
  return content
}

const RETRYABLE = ['429', '404', '400', '503', 'rate', 'quota', 'overload',
  'empty', 'no endpoint', 'not a valid', 'not found', 'timed out',
  'unavailable', 'free', 'capacity', 'provider returned']

function isRetryable(msg) {
  return RETRYABLE.some(k => msg.toLowerCase().includes(k))
}

export async function callAI(messages, maxTokens = 8000) {
  const normalized = messages.map(m => ({
    role: m.role,
    content: Array.isArray(m.content)
      ? m.content.map(c => c.text || '').join('')
      : m.content,
  }))

  const models = await getFreeModels()

  for (const model of models) {
    try {
      return await orCall(model, normalized, maxTokens)
    } catch (e) {
      console.warn(`❌ ${model}:`, e.message)
      if (!isRetryable(e.message)) throw e
      await new Promise(r => setTimeout(r, 1500))
    }
  }
  throw new Error('All free models failed. Try again in a minute.')
}

export async function callAIVision(base64, mimeType, prompt) {
  const VISION = ['nvidia/nemotron-nano-12b-v2-vl:free']
  for (const model of VISION) {
    try {
      const res = await fetchWithTimeout(OR_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OR_KEY}`,
          'HTTP-Referer': 'https://devlens.app',
          'X-Title': 'DevLens AI Builder',
        },
        body: JSON.stringify({
          model, max_tokens: 4096,
          messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
            { type: 'text', text: prompt },
          ]}],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      return data.choices?.[0]?.message?.content || ''
    } catch (e) {
      console.warn(`Vision ${model} failed:`, e.message)
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  throw new Error('Vision models unavailable.')
}