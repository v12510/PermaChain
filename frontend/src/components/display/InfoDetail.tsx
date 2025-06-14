'use client'

import { useEffect, useState } from 'react'
import { fetchIPFSContent } from '@/lib/storage/ipfs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

export default function InfoDetail({ contentHash }: { contentHash: string }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchIPFSContent(contentHash)
        setContent(data)
      } catch (error) {
        console.error('Failed to load content:', error)
        setContent('*无法加载内容*')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadContent()
  }, [contentHash])

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded" />

  return (
    <article className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}