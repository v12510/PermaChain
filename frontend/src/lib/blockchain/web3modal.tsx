'use client'

import { ReactNode } from 'react'
import { Web3Modal } from '@web3modal/ethers/react'
import { projectId, metadata } from './config'

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Web3Modal 
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode="dark"
        themeVariables={{
          '--w3m-accent': '#3B82F6',
          '--w3m-border-radius-master': '4px'
        }}
      />
    </>
  )
}