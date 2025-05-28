'use client'
import { useEffect, useMemo, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { EditorContent, useEditor } from '@tiptap/react'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabaseClient'

interface EditorProps {
  user: User
  docId: string
}

const Editor = ({ user, docId }: EditorProps) => {
  const [isProviderReady, setIsProviderReady] = useState(false)
  
  // Yjs document and provider initialization
  const { ydoc, provider } = useMemo(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider(
      'ws://localhost:1234',
      docId,
      ydoc,
      { connect: false }
    )
    return { ydoc, provider }
  }, [docId])

  // Required base extensions (always present)
  const baseExtensions = useMemo(() => [
    Document.configure({
      content: 'paragraph+', // Document must contain at least one paragraph
    }),
    Paragraph,
    Text
  ], [])

  // Collaboration extensions (only when provider is ready)
  const collaborationExtensions = useMemo(() => {
    if (!isProviderReady) return []
    
    return [
      Collaboration.configure({
        document: ydoc,
        field: 'default',
        fragment: Y.Text
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: user.user_metadata?.name || user.email || 'Anonymous',
          color: '#f56565',
        },
      })
    ]
  }, [isProviderReady, ydoc, provider, user])

  // Provider connection management
  useEffect(() => {
    provider.connect()
    setIsProviderReady(true)
    
    return () => {
      provider.disconnect()
      setIsProviderReady(false)
    }
  }, [provider])

  // Content synchronization
  useEffect(() => {
    if (!isProviderReady) return

    const yText = ydoc.getText('default')
    
    const loadContent = async () => {
      try {
        const { data } = await supabase
          .from('documents')
          .select('content')
          .eq('id', docId)
          .single()

        if (data?.content && yText.length === 0) {
          ydoc.transact(() => {
            yText.insert(0, data.content)
          })
        }
      } catch (error) {
        console.error('Content load error:', error)
      }
    }

    provider.on('sync', (isSynced: boolean) => isSynced && loadContent())
    return () => provider.off('sync', () => {})
  }, [isProviderReady, ydoc, provider, docId])

  // Editor instance with combined extensions
  const editor = useEditor({
    extensions: [...baseExtensions, ...collaborationExtensions],
    editable: true,
  })

  // Cleanup
  useEffect(() => {
    return () => {
      provider?.disconnect()
      ydoc?.destroy()
    }
  }, [provider, ydoc])

  if (!editor) {
    return <div className="p-4">Initializing editor...</div>
  }

  return (
    <div className="h-screen p-4 relative">
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  )
}

export default Editor