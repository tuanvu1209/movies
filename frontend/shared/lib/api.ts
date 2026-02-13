import axios from 'axios'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim()

const api = axios.create({
  baseURL: `${API_URL}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      if (url.includes('/users/') || url.includes('/auth/')) {
        localStorage.removeItem('token')
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

export const getBluphimMovieInfo = async (url: string, episode?: number) => {
  const params = new URLSearchParams({ url })
  if (episode) {
    params.append('episode', episode.toString())
  }
  const response = await api.get(`/movies/info?${params.toString()}`)
  return response.data
}

export const getBluphimHomepage = async () => {
  const response = await api.get('/movies/homepage')
  return response.data
}

export const getNav = async () => {
  const response = await api.get('/nav')
  return response.data
}

export const getCategory = async (slug: string, page: number = 1) => {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', page.toString())
  const q = params.toString()
  const url = `/movies/category/${encodeURIComponent(slug)}${q ? `?${q}` : ''}`
  const response = await api.get(url)
  return response.data
}

export const getSearch = async (query: string) => {
  const q = (query || '').trim()
  if (q.length < 2) return []
  const response = await api.get(`/movies/search?q=${encodeURIComponent(q)}`)
  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/users/profile')
  return response.data
}

export default api
