import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Collab Editor',
  description: 'Built with Tiptap, Yjs, and Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body 
        className="bg-white text-black font-sans"
        suppressHydrationWarning // Add this attribute
      >
        {children}
      </body>
    </html>
  )
}