'use client'

import { useState, useEffect } from 'react'
import { fetchIPFSContent } from '@/lib/storage/ipfs'
import { FileText, ImageIcon, VideoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

const TYPE_ICONS = {
  'image/': ImageIcon,
  'video/': VideoIcon,
  'application/pdf': FileText,
}

export default function AttachmentViewer({ 
  hash, 
  type 
}: { 
  hash: string 
  type: string 
}) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAttachment = async () => {
      try {
        const ipfsUrl = `https://ipfs.io/ipfs/${hash}`
        
        // 如果是图片或视频直接使用IPFS网关
        if (type.startsWith('image/') || type.startsWith('video/')) {
          setUrl(ipfsUrl)
        } 
        // PDF等文档类型需要特殊处理
        else {
          const res = await fetch(ipfsUrl)
          const blob = await res.blob()
          setUrl(URL.createObjectURL(blob))
        }
      } catch (error) {
        console.error('Failed to load attachment:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAttachment()

    return () => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    }
  }, [hash, type])

  const Icon = Object.entries(TYPE_ICONS).find(([prefix]) => 
    type.startsWith(prefix)
  )?.[1] || FileText

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          <Icon className="w-4 h-4 mr-2" />
          {isLoading ? '加载中...' : '预览附件'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl p-0">
        {url && (
          type.startsWith('image/') ? (
            <img 
              src={url} 
              alt="附件预览" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          ) : type.startsWith('video/') ? (
            <video 
              src={url}
              controls
              className="w-full max-h-[80vh]"
            />
          ) : (
            <iframe 
              src={url}
              className="w-full h-[80vh] border-none"
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}