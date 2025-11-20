"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  connect: async () => {},
  disconnect: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const connect = async () => {
    // Mock wallet connection for demo
    setIsConnected(true)
    setAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
  }

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}

// Compatibility hooks for wagmi migration
export function useAccount() {
  const { isConnected, address } = useWallet()
  return { isConnected, address }
}

export function useDisconnect() {
  const { disconnect } = useWallet()
  return { disconnect: () => disconnect() }
}
