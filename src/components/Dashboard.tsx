'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'


export default function Dashboard({ user }: { user: any }) {
  const [docs, setDocs] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchDocs = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setDocs(data || [])
    }
    fetchDocs()
  }, [user])

  const createDocument = async () => {
    if (!title.trim()) return alert('Please enter a valid title')
    
    const { data, error } = await supabase
      .from('documents')
      .insert({ 
        user_id: user.id, 
        title: title.trim(),
        content: ''
      })
      .select('id')
      .single()

    if (!error) router.push(`/editor/${data.id}`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const content = reader.result as string
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: file.name,
          content,
        })
        .select()
        .single()

      if (!error) router.push(`/editor/${data.id}`)
      else console.error(error)
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Your Documents</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New Document Title"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={createDocument}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="border px-2 py-1 rounded"
        />
      </div>

      <ul className="space-y-2">
        {docs.map((doc) => (
          <li key={doc.id}>
            <button
              onClick={() => router.push(`/editor/${doc.id}`)}
              className="text-blue-700 hover:underline"
            >
              📄 {doc.title || 'Untitled Document'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}


