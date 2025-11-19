'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  connectedAddress: string | null;
  connectedChain: string | null;
  isConnected: boolean;
  connect: (address: string, chain: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      connectedAddress: null,
      connectedChain: null,
      isConnected: false,
      connect: (address: string, chain: string) =>
        set({ connectedAddress: address, connectedChain: chain, isConnected: true }),
      disconnect: () =>
        set({ connectedAddress: null, connectedChain: null, isConnected: false }),
    }),
    {
      name: 'wallet-storage',
    }
  )
);
