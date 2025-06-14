"use client";
import { useState } from "react";
import { useWalletStore } from "@/stores/useWalletStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import TagInput from "@/components/ui/TagInput";
import { uploadToIPFS } from "@/lib/storage/ipfs";
import { InformationStorage__factory } from "@/abis/types";
import { Suspense } from "react";
import InfoCard from "@/components/display/InfoCard";
import SearchBar from "@/components/search/SearchBar";
import { fetchLatestInformations } from "@/lib/api";
import WalletButton from "@/components/web3/WalletButton";

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signer, chainId } = useWalletStore();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!signer || !chainId) return;
    setIsSubmitting(true);

    try {
      // 1. 上传内容到IPFS
      const contentHash = await uploadToIPFS(content);
      
      // 2. 如果有文件则上传
      let attachmentHash = "";
      if (file) {
        attachmentHash = await uploadToIPFS(file);
      }

      // 3. 调用合约
      const contract = InformationStorage__factory.connect(
        CONTRACT_ADDRESSES[chainId],
        signer
      );

      const tx = await contract.submitInformation(
        title,
        contentHash,
        tags,
        attachmentHash,
        file?.type || "",
        "", // Google Cloud URL由后端处理
        { value: ethers.utils.parseEther("0.01") }
      );

      await tx.wait();
      router.push("/");
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">提交新信息</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded min-h-[200px]"
          />
        </div>

        <TagInput tags={tags} onChange={setTags} />

        <FileUpload onFileChange={setFile} />

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !title || !content}
          className="mt-4"
        >
          {isSubmitting ? "提交中..." : "提交到区块链"}
        </Button>
      </div>
    </div>
  );
}


export default async function Home() {
  const data = await fetchLatestInformations();

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">区块链信息存档</h1>
        <WalletButton />
      </div>

      <SearchBar className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          {data.map((info) => (
            <InfoCard key={`${info.chainId}-${info.id}`} data={info} />
          ))}
        </Suspense>
      </div>
    </main>
  );
}