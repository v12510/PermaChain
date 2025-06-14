'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

interface TagItem {
  name: string
  count: number
}

// 标签大小映射函数
const getTagSize = (count: number, maxCount: number) => {
  const ratio = count / maxCount
  if (ratio > 0.7) return 'text-2xl'
  if (ratio > 0.4) return 'text-xl'
  if (ratio > 0.2) return 'text-lg'
  return 'text-base'
}

export default function TagCloud({
  maxTags = 30,
  className,
}: {
  maxTags?: number
  className?: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentChain = searchParams.get('chain')
  const currentTag = searchParams.get('tag')

  // 获取标签数据
  const { data: tags, isLoading } = useQuery<TagItem[]>({
    queryKey: ['tags', currentChain],
    queryFn: async () => {
      const res = await api.get('/tags', {
        params: { 
          chain: currentChain,
          limit: maxTags 
        }
      })
      return res.data
    },
    staleTime: 60 * 1000 // 1分钟缓存
  })

  // 计算最大标签数量用于大小比例
  const maxCount = tags?.[0]?.count || 1

  // 创建URL搜索参数
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap gap-3", className)}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    )
  }

  if (!tags || tags.length === 0) {
    return (
      <div className={cn("text-center text-muted-foreground py-4", className)}>
        暂无标签数据
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap gap-3 justify-center", className)}>
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`${pathname}?${createQueryString('tag', tag.name)}`}
          className={cn(
            'px-4 py-2 rounded-full transition-all hover:scale-105',
            'bg-secondary hover:bg-primary hover:text-primary-foreground',
            getTagSize(tag.count, maxCount),
            currentTag === tag.name 
              ? 'bg-primary text-primary-foreground font-medium' 
              : 'text-muted-foreground'
          )}
          title={`${tag.count} 条相关内容`}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}