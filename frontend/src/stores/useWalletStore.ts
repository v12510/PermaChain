import { create } from "zustand";
import { ethers } from "ethers";

interface WalletState {
  address: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connect: (params: ConnectParams) => void;
  disconnect: () => void;
}

interface ConnectParams {
  address: string;
  chainId: number;
  provider: ethers.providers.Web3Provider;
  signer: ethers.Signer;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  chainId: null,
  provider: null,
  signer: null,
  connect: ({ address, chainId, provider, signer }) => {
    set({ address, chainId, provider, signer });
    localStorage.setItem("connected", "true");
  },
  disconnect: () => {
    set({ address: null, chainId: null, provider: null, signer: null });
    localStorage.removeItem("connected");
  }
}));