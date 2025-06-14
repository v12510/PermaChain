import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { InformationStorage__factory } from '@/abis/types'
import { getProvider } from '@/lib/blockchain/providers'
import InfoDetail from '@/components/display/InfoDetail'
import AttachmentViewer from '@/components/display/AttachmentViewer'
import AuthorProfile from '@/components/display/AuthorProfile'
import RelatedInfo from '@/components/display/RelatedInfo'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getChainConfig } from '@/lib/blockchain/config'
import { formatTimestamp } from '@/lib/utils'

interface PageProps {
  params: { id: string }
  searchParams: { chain?: string }
}

export default async function InformationDetailPage({ 
  params, 
  searchParams 
}: PageProps) {
  const chainId = searchParams.chain ? parseInt(searchParams.chain) : getChainConfig().defaultChain
  const chainConfig = getChainConfig(chainId)
  
  // 获取链上数据
  const info = await fetchInformation(chainId, params.id)
  if (!info) return notFound()

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主内容区 */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold break-words">
            {info.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatTimestamp(info.timestamp)}</span>
            <span>•</span>
            <span>{chainConfig.name}</span>
          </div>
          
          <Separator />
          
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <InfoDetail contentHash={info.contentHash} />
          </Suspense>
          
          {info.attachmentHash && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">附件</h2>
              <AttachmentViewer 
                hash={info.attachmentHash} 
                type={info.attachmentType} 
              />
            </div>
          )}
        </div>
        
        {/* 侧边栏 */}
        <div className="space-y-8">
          <AuthorProfile 
            address={info.author} 
            chainId={chainId}
          />
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">标签</h3>
            <div className="flex flex-wrap gap-2">
              {info.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-secondary rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <RelatedInfo 
            tags={info.tags} 
            currentId={params.id}
            chainId={chainId}
          />
        </div>
      </div>
    </div>
  )
}

async function fetchInformation(chainId: number, id: string) {
  try {
    const provider = getProvider(chainId)
    const contract = InformationStorage__factory.connect(
      getChainConfig(chainId).contractAddress,
      provider
    )
    
    const [
      title,
      contentHash,
      author,
      tags,
      attachmentHash,
      attachmentType,
      timestamp,
      googleCloudURL
    ] = await contract.getInformation(id)
    
    return {
      id,
      chainId,
      title,
      contentHash,
      author,
      tags,
      attachmentHash,
      attachmentType,
      timestamp: timestamp.toNumber(),
      googleCloudURL
    }
  } catch (error) {
    console.error(`Failed to fetch info ${id} on chain ${chainId}:`, error)
    return null
  }
}

export async function generateMetadata({
  params,
  searchParams
}: PageProps): Promise<Metadata> {
  const chainId = searchParams.chain ? parseInt(searchParams.chain) : getChainConfig().defaultChain
  const info = await fetchInformation(chainId, params.id)
  
  return {
    title: info?.title || '信息详情',
    description: info 
      ? `由${info.author.slice(0, 6)}...${info.author.slice(-4)}提交的区块链存档信息`
      : '查看区块链上的存档信息',
    openGraph: {
      images: info?.attachmentType?.startsWith('image/') 
        ? [`https://ipfs.io/ipfs/${info.attachmentHash}`] 
        : []
    }
  }
}