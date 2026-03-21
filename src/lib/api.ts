import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return { supabase, user }
}

export function ok<T>(data: T, meta?: object, status = 200) {
  return NextResponse.json({ data, ...(meta && { meta }) }, { status })
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 })
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function unauthorized() {
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
}

export function notFound(resource = 'Resource') {
  return NextResponse.json({ error: { code: 'NOT_FOUND', message: `${resource} not found` } }, { status: 404 })
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: { code: 'BAD_REQUEST', message, details } }, { status: 400 })
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: { code: 'FORBIDDEN', message } }, { status: 403 })
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 })
}
