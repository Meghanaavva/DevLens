const OR_KEY  = process.env.OPENROUTER_KEY
const OR_BASE = 'https://openrouter.ai/api/v1/chat/completions'

const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3-coder:free',
]

const VISION_MODELS = [
  'nvidia/nemotron-nano-12b-v2-vl:free',
]

async function orCall(model, messages, maxTokens = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90000)
  try {
    const res = await fetch(OR_BASE, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OR_KEY}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'Inspectra',
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.85, messages }),
    })
    clearTimeout(timer)
    const data = await res.json()
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
    const content = data.choices?.[0]?.message?.content || ''
    if (!content) throw new Error('Empty response')
    return { content, model }
  } catch (e) {
    clearTimeout(timer)
    if (e.name === 'AbortError') throw new Error('Timed out after 90s')
    throw e
  }
}

const RETRYABLE = ['429', '503', 'rate', 'quota', 'overload', 'empty', 'timed out', 'unavailable', 'free', 'capacity']
const isRetryable = (msg) => RETRYABLE.some(k => msg.toLowerCase().includes(k))

export async function callAI(messages, maxTokens = 8000) {
  let lastErr
  for (const model of FREE_MODELS) {
    try {
      return await orCall(model, messages, maxTokens)
    } catch (e) {
      lastErr = e
      if (!isRetryable(e.message)) throw e
      await new Promise(r => setTimeout(r, 1500))
    }
  }
  throw lastErr || new Error('All models failed')
}

export async function callAIVision(base64, mimeType, prompt) {
  for (const model of VISION_MODELS) {
    try {
      return await orCall(model, [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: prompt },
        ],
      }], 4096)
    } catch (e) {
      console.warn(`Vision model ${model} failed:`, e.message)
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  throw new Error('Vision models unavailable')
}