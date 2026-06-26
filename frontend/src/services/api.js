const BASE_URL = import.meta.env.VITE_API_URL || 'https://dev-lens-gamma.vercel.app/api'

const getToken = () => localStorage.getItem('token')

const headers = (isFormData = false) => {
  const token = getToken()
  const h = {}
  if (!isFormData) h['Content-Type'] = 'application/json'
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

const handleRes = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (body) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  login: (body) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  me: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: headers() }).then(handleRes),
}

// ── User ──────────────────────────────────────────────
export const userAPI = {
  getProfile: () =>
    fetch(`${BASE_URL}/user/profile`, { headers: headers() }).then(handleRes),

  updateProfile: (body) =>
    fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  deleteAccount: () =>
    fetch(`${BASE_URL}/user/account`, {
      method: 'DELETE', headers: headers(),
    }).then(handleRes),
}

// ── Inspect ───────────────────────────────────────────
export const inspectAPI = {
  inspectCode: (body) =>
    fetch(`${BASE_URL}/inspect/code`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  inspectFile: (file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE_URL}/inspect/file`, {
      method: 'POST', headers: headers(true), body: form,
    }).then(handleRes)
  },
}

// ── Build ─────────────────────────────────────────────
export const buildAPI = {
  generate: (body) =>
    fetch(`${BASE_URL}/build/generate`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  explain: (body) =>
    fetch(`${BASE_URL}/build/explain`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  fix: (body) =>
    fetch(`${BASE_URL}/build/fix`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),
}

// ── Snippets ──────────────────────────────────────────
export const snippetsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/snippets`, { headers: headers() }).then(handleRes),

  getOne: (id) =>
    fetch(`${BASE_URL}/snippets/${id}`, { headers: headers() }).then(handleRes),

  create: (body) =>
    fetch(`${BASE_URL}/snippets`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  update: (id, body) =>
    fetch(`${BASE_URL}/snippets/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(body),
    }).then(handleRes),

  delete: (id) =>
    fetch(`${BASE_URL}/snippets/${id}`, {
      method: 'DELETE', headers: headers(),
    }).then(handleRes),
}

// ── History ───────────────────────────────────────────
export const historyAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/history`, { headers: headers() }).then(handleRes),

  clear: () =>
    fetch(`${BASE_URL}/history`, {
      method: 'DELETE', headers: headers(),
    }).then(handleRes),
}