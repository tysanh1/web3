export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  tokenURI: string;
  createdAt: string;
  price: string;
  currency: string;
  category: string;
  collection: string;
  views: number;
  likes: number;
  // Blockchain-related fields
  contractAddress?: string;
  tokenId?: string;
  blockNumber?: number;
  chainId?: number;
}

export interface NFTFormData {
  name: string;
  description?: string;
  category?: string;
  collection?: string;
  price?: string;
  image: File | string;
  royalty?: string;
}


export interface Transaction {
  hash: string;
  from: string;
  to: string;
  tokenId: string;
  timestamp: string;
  type: 'mint' | 'transfer';
  // Blockchain-related fields
  blockNumber?: number;
  gasUsed?: string;
  confirmations?: number;
  chainId?: number;
}

export interface SmartContractConfig {
  address: string;
  abi: any[];
  chainId: number;
  name?: string;
  symbol?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
  isTestnet: boolean;
}
