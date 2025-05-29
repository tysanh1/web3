import { NFT, Transaction, NFTFormData } from "@/types/nft";
import { smartContractService } from "./smartContractService";
import { ethers, EventLog, Log } from "ethers";

// Mock data structure matching Marketplace
const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "Cosmic Dreamer #1",
    image: "https://picsum.photos/id/123/800/800",
    price: "0.5",
    currency: "ETH",
    creator: "CryptoPunks",
    category: "art",
    collection: "CryptoPunks",
    description:
      "A journey through the cosmic dreamscape of the digital universe.",
    views: 1500,
    likes: 120,
    owner: "0x1234567890123456789012345678901234567890",
    tokenURI: "ipfs://mock/1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Neon Ape #42",
    image: "https://picsum.photos/id/124/800/800",
    price: "2.5",
    currency: "ETH",
    creator: "Bored Ape Yacht Club",
    category: "collectibles",
    collection: "Bored Ape Yacht Club",
    description: "A unique neon-themed ape from the famous collection.",
    views: 4200,
    likes: 350,
    owner: "0x1234567890123456789012345678901234567890",
    tokenURI: "ipfs://mock/2",
    createdAt: new Date().toISOString(),
  },
];

let mockTransactions: Transaction[] = [
  {
    hash: "0xabc123",
    from: "0x0000000000000000000000000000000000000000",
    to: "0x1234567890123456789012345678901234567890",
    tokenId: "1",
    timestamp: new Date().toISOString(),
    type: "mint",
  },
  {
    hash: "0xdef456",
    from: "0x0000000000000000000000000000000000000000",
    to: "0x1234567890123456789012345678901234567890",
    tokenId: "2",
    timestamp: new Date().toISOString(),
    type: "mint",
  },
  {
    hash: "0xghi789",
    from: "0x0000000000000000000000000000000000000000",
    to: "0x1234567890123456789012345678901234567890",
    tokenId: "3",
    timestamp: new Date().toISOString(),
    type: "mint",
  },
];

// Simulate a delay to mimic blockchain interactions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const nftService = {
  // Get contract instance
  getContract: async (needSigner = false) => {
    return smartContractService.getContract(needSigner);
  },

  getNFTsByOwner: async (owner: string): Promise<NFT[]> => {
    try {
      // Get contract instance
      const contract = await smartContractService.getContract();

      // Get balance of owner
      const balance = await contract.balanceOf(owner);
      const nfts: NFT[] = [];

      // Fetch each NFT owned by the address
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(owner, i);
        const tokenURI = await contract.tokenURI(tokenId);
        const metadata = await fetch(tokenURI).then((res) => res.json());

        nfts.push({
          id: tokenId.toString(),
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          owner: owner,
          creator: metadata.creator || owner,
          tokenURI: tokenURI,
          createdAt: new Date().toISOString(),
          price: metadata.price || "0",
          currency: "ETH",
          category: metadata.category || "art",
          collection: metadata.collection || "Unknown",
          views: metadata.views || 0,
          likes: metadata.likes || 0,
        });
      }

      return nfts;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      throw error;
    }
  },

  getAllNFTs: async (): Promise<NFT[]> => {
    try {
      const contract = await smartContractService.getContract();
      const totalSupply = await contract.totalSupply();
      const nfts: NFT[] = [];

      for (let i = 0; i < totalSupply; i++) {
        const tokenId = await contract.tokenByIndex(i);
        const tokenURI = await contract.tokenURI(tokenId);
        const owner = await contract.ownerOf(tokenId);
        const metadata = await fetch(tokenURI).then((res) => res.json());

        nfts.push({
          id: tokenId.toString(),
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          owner: owner,
          creator: metadata.creator || owner,
          tokenURI: tokenURI,
          createdAt: new Date().toISOString(),
          price: metadata.price || "0",
          currency: "ETH",
          category: metadata.category || "art",
          collection: metadata.collection || "Unknown",
          views: metadata.views || 0,
          likes: metadata.likes || 0,
        });
      }

      return nfts;
    } catch (error) {
      console.error("Error fetching all NFTs:", error);
      return mockNFTs;
    }
  },

  getNFTById: async (id: string): Promise<NFT | null> => {
    try {
      const contract = await smartContractService.getContract();
      const owner = await contract.ownerOf(id);
      const tokenURI = await contract.tokenURI(id);
      const metadata = await fetch(tokenURI).then((res) => res.json());

      return {
        id: id,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        owner: owner,
        creator: metadata.creator || owner,
        tokenURI: tokenURI,
        createdAt: new Date().toISOString(),
        price: metadata.price || "0",
        currency: "ETH",
        category: metadata.category || "art",
        collection: metadata.collection || "Unknown",
        views: metadata.views || 0,
        likes: metadata.likes || 0,
      };
    } catch (error) {
      console.error("Error fetching NFT by ID:", error);
      return null;
    }
  },

  uploadToIPFS: async (file: File): Promise<string> => {
    try {
      // Implement your IPFS upload logic here
      return URL.createObjectURL(file);
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      throw error;
    }
  },
  uploadJSONToIPFS: async (metadata: any): Promise<string> => {
    try {
      // Implement your IPFS metadata upload logic here
      return `ipfs://mock/${Date.now()}`;
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
      throw error;
    }
  },

  createNFT: async (data: NFTFormData, creator: string): Promise<NFT> => {
    try {
      // Use smartContractService directly for minting
      return smartContractService.mintNFT(data, creator);
    } catch (error) {
      console.error("Error creating NFT:", error);
      throw error;
    }
  },

  transferNFT: async (
    from: string,
    to: string,
    tokenId: string
  ): Promise<boolean> => {
    try {
      const contract = await smartContractService.getContract(true);
      const tx = await contract.transferFrom(from, to, tokenId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error transferring NFT:", error);
      return false;
    }
  },

  getTransactionsByUser: async (address: string): Promise<Transaction[]> => {
    try {
      const contract = await smartContractService.getContract();
      const filter = contract.filters.Transfer(address, null, null);
      const events = await contract.queryFilter(filter);

      return events.map((event) => {
        const ev = event as EventLog;
        return {
          hash: ev.transactionHash,
          from: ev.args?.from,
          to: ev.args?.to,
          tokenId: ev.args?.tokenId.toString(),
          timestamp: new Date().toISOString(), // Có thể lấy actual block timestamp nếu cần
          type: ev.args?.from === ethers.ZeroAddress ? "mint" : "transfer",
        };
      });
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      return mockTransactions.filter(
        (tx) =>
          tx.from.toLowerCase() === address.toLowerCase() ||
          tx.to.toLowerCase() === address.toLowerCase()
      );
    }
  },

  getTransactionsByNFT: async (tokenId: string): Promise<Transaction[]> => {
    try {
      const contract = await smartContractService.getContract();
      const filter = contract.filters.Transfer(null, null, tokenId);
      const events = await contract.queryFilter(filter);

      return events.map((event) => {
        const eventLog = event as EventLog;
        return {
          hash: event.transactionHash,
          from: eventLog.args?.[0],
          to: eventLog.args?.[1],
          tokenId: eventLog.args?.[2].toString(),
          timestamp: new Date().toISOString(),
          type: eventLog.args?.[0] === ethers.ZeroAddress ? "mint" : "transfer",
        };
      });
    } catch (error) {
      console.error("Error fetching NFT transactions:", error);
      return [];
    }
  },
};
