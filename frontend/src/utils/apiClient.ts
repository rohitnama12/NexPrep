import { createClient } from '@/utils/supabase/client'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options.headers || {})
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // endpoint should start with a slash, e.g., '/tutor/chat'
  const url = `${BASE_URL}${endpoint}`

  return fetch(url, {
    ...options,
    headers,
  })
}

export async function fetchApiFormData(endpoint: string, formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers()
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  // Do NOT set Content-Type for FormData; the browser sets it with the boundary

  const url = `${BASE_URL}${endpoint}`

  return fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })
}
