const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/tasks'

async function request(path = '', options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      message = body.error || body.message || message
    } catch {
      // Keep the fallback message if the server didn't return JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export const taskApi = {
  getAll: () => request(),
  create: (task) => request('', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, task) => request(`/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  remove: (id) => request(`/${id}`, { method: 'DELETE' })
}
