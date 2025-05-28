'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/utils/supabaseClient'
import type { User } from '@supabase/supabase-js'

// Lazy-load components to avoid hydration issues
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false })
const Auth = dynamic(() => import('@/components/Auth'), { ssr: false })

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(data.user)
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading...
      </div>
    )
  }

  return <>{user ? <Dashboard user={user} /> : <Auth />}</>
}
