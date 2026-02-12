'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/shared/lib/api'
import { useAuth } from '../contexts/AuthContext'

export function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await register(name, email, password)
      setUser(response.user)
      localStorage.setItem('token', response.access_token)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-netflix-dark p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-8 text-center text-white">
            Sign Up
          </h1>
          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-netflix-gray text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-netflix-gray text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-netflix-gray text-white p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-netflix-red text-white py-3 rounded font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-center text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-white hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
