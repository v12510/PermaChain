import { create } from "ipfs-http-client";

const client = create({
  host: process.env.NEXT_PUBLIC_IPFS_HOST || "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.NEXT_PUBLIC_IPFS_API_KEY}:${process.env.NEXT_PUBLIC_IPFS_API_SECRET}`
    ).toString("base64")}`
  }
});

export async function uploadToIPFS(content: string | File): Promise<string> {
  try {
    let contentToUpload: any;
    
    if (typeof content === "string") {
      contentToUpload = new Blob([content], { type: "text/plain" });
    } else {
      contentToUpload = content;
    }

    const { cid } = await client.add(contentToUpload);
    await client.pin.add(cid);
    return cid.toString();
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw new Error("Failed to upload to IPFS");
  }
}