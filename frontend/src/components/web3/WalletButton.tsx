"use client";
import { useWeb3Modal } from "@web3modal/ethers5/react";
import { useEffect } from "react";
import { useWalletStore } from "@/stores/useWalletStore";
import { Button } from "./ui/button";
import { shortenAddress } from "@/lib/utils";

export default function WalletButton() {
  const { open } = useWeb3Modal();
  const { address, chainId, connect, disconnect } = useWalletStore();

  // 自动连接已登录的钱包
  useEffect(() => {
    if (window.ethereum?.isConnected()) {
      handleConnect();
    }
  }, []);

  const handleConnect = async () => {
    try {
      const provider = await open();
      if (provider) {
        const signer = await provider.getSigner();
        connect({
          address: await signer.getAddress(),
          chainId: (await provider.getNetwork()).chainId,
          provider,
          signer
        });
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  return (
    <Button
      variant={address ? "outline" : "default"}
      onClick={address ? disconnect : handleConnect}
      className="min-w-[120px]"
    >
      {address ? shortenAddress(address) : "Connect Wallet"}
    </Button>
  );
}