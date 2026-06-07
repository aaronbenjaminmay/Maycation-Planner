import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, supabase } from './supabaseClient'

export async function getCurrentSession() {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export function listenForAuthChanges(
  callback: (session: Session | null) => void,
) {
  if (!supabase) {
    return () => undefined
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })

  return () => subscription.unsubscribe()
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
) {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
) {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const client = getSupabaseClient()
  const { error } = await client.auth.signOut()

  if (error) {
    throw error
  }
}

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getCurrentSession()
      .then((currentSession) => {
        if (!isMounted) {
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    const unsubscribe = listenForAuthChanges((nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  return {
    isLoading,
    session,
    user,
  }
}
