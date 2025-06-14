import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Modal } from '@/lib/blockchain/web3modal'
import { WalletProvider } from '@/lib/blockchain/provider'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { config } from '@/lib/blockchain/config'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/layout/Header'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '区块链信息存档',
  description: '永久保存信息到区块链网络',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 从cookie中初始化钱包状态
  const initialState = cookieToInitialState(config, headers().get('cookie'))
  
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased"
      )}>
        <WalletProvider initialState={initialState}>
          <Web3Modal>
            <div className="flex flex-col min-h-screen">
              <Header />
              
              <main className="flex-1 container py-8">
                {children}
              </main>

              <footer className="border-t py-6">
                <div className="container text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} 区块链信息存档 - 所有数据永久存储在链上
                </div>
              </footer>
            </div>

            <Toaster position="top-center" />
          </Web3Modal>
        </WalletProvider>
      </body>
    </html>
  )
}