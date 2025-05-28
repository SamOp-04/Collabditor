'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <div className="p-4">Loading editor...</div>
})

export default function EditorPage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription?.unsubscribe()
  }, [])

  if (!id || Array.isArray(id)) return <div className="p-4">Invalid document ID</div>
  if (!user) return <div className="p-4">Please login to access the editor</div>

  return <Editor user={user} docId={id} />
}