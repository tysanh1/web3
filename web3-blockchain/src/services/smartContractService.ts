import { ethers } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "../contracts/NFTContract";
import { NFT, NFTFormData, Transaction } from "@/types/nft";
import { v4 as uuidv4 } from "uuid";
import { localNFTService } from "./localNFTService";
import { SUPPORTED_NETWORKS } from "@/context/Web3Context";

// Helper to check if window.ethereum is available
const isEthereumAvailable = () => {
  return typeof window !== "undefined" && window.ethereum !== undefined;
};

// Get ethers provider to interact with the blockchain
const getProvider = async () => {
  if (!isEthereumAvailable()) {
    throw new Error("Ethereum provider not found. Please install MetaMask.");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// Get signer for transactions
const getSigner = async () => {
  const provider = await getProvider();
  return provider.getSigner();
};

// Get current network information
const getNetworkInfo = async () => {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  return {
    chainId,
    networkInfo: SUPPORTED_NETWORKS[chainId] || {
      chainId,
      name: network.name || "Unknown Network",
      currency: "ETH",
      rpcUrl: "",
      blockExplorer: "",
      isTestnet: false,
    },
  };
};

// Store NFTs in localStorage for development
const LOCAL_STORAGE_KEY = "nfts";
const TRANSACTIONS_KEY = "transactions";

const getStoredNFTs = (): NFT[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const storeNFTs = (nfts: NFT[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nfts));
};

export const smartContractService = {
  // Connect to wallet and return address
  connectWallet: async (): Promise<string> => {
    if (!isEthereumAvailable()) {
      throw new Error("Ethereum provider not found. Please install MetaMask.");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return accounts[0];
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      throw new Error(error.message || "Failed to connect wallet");
    }
  },

  // Get current chain ID
  getChainId: async (): Promise<number> => {
    if (!isEthereumAvailable()) {
      throw new Error("Ethereum provider not found.");
    }

    const { chainId } = await getNetworkInfo();
    return chainId;
  },

  // Check if the wallet is connected to the correct network
  checkNetwork: async (requiredChainId: number): Promise<boolean> => {
    const { chainId } = await getNetworkInfo();
    return chainId === requiredChainId;
  },

  // Switch to a specific network
  switchNetwork: async (chainId: number): Promise<boolean> => {
    if (!isEthereumAvailable()) {
      throw new Error("Ethereum provider not found.");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (error: any) {
      // This error code indicates the chain has not been added to MetaMask
      if (error.code === 4902) {
        // If we have network configuration, try to add it
        const network = SUPPORTED_NETWORKS[chainId];
        if (network) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.currency,
                    symbol: network.currency,
                    decimals: 18,
                  },
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.blockExplorer],
                },
              ],
            });
            return true;
          } catch (addError) {
            console.error("Error adding network:", addError);
            throw new Error("Failed to add network to wallet");
          }
        } else {
          throw new Error("Network configuration not found");
        }
      }
      console.error("Error switching network:", error);
      throw new Error(error.message || "Failed to switch network");
    }
  },

  // Get user's balance
  getBalance: async (address: string): Promise<string> => {
    const provider = await getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  },

  // Get NFT contract
  getContract: async (needSigner = false) => {
    try {
      const provider = await getProvider();
      
      // Check if contract exists at the address
      const code = await provider.getCode(NFT_CONTRACT_ADDRESS);
      if (code === '0x') {
        console.warn('Contract not deployed at this address, returning null');
        return null;
      }

      // Get network info
      const { chainId, networkInfo } = await getNetworkInfo();
      console.log('Current network:', networkInfo.name, 'Chain ID:', chainId);

      if (needSigner) {
        const signer = await getSigner();
        const contract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          signer
        );
        // Verify contract is accessible
        await contract.name().catch(e => {
          console.warn('Contract not accessible with current signer, returning null');
          return null;
        });
        return contract;
      }

      const contract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      
      // Verify contract is accessible
      await contract.name().catch(e => {
        console.warn('Contract not accessible with current provider, returning null');
        return null;
      });
      
      return contract;
    } catch (error: any) {
      console.warn('Error getting contract:', error.message);
      return null;
    }
  },

  // Mint a new NFT
  mintNFT: async (data: NFTFormData, ownerAddress: string): Promise<NFT> => {
    try {
      // Check wallet connection
      if (!isEthereumAvailable()) {
        throw new Error("Ethereum wallet not found. Please install MetaMask.");
      }

      // Get contract with signer
      const contract = await smartContractService.getContract(true);
      if (!contract) {
        throw new Error("Failed to get contract instance");
      }

      // Get current network information
      const { chainId, networkInfo } = await getNetworkInfo();

      // Upload image to IPFS (simulated)
      let imageUrl: string;
      const imageData = data.image;
      
      if (imageData instanceof File) {
        // Convert File to data URL
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert image to data URL'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageData);
        });
      } else if (typeof imageData === 'string') {
        imageUrl = imageData;
      } else {
        throw new Error('Invalid image data provided');
      }

      // Create metadata
      const metadata = {
        name: data.name,
        description: data.description || "",
        image: imageUrl,
        attributes: {
          category: data.category || "art",
          collection: data.collection || "My Collection",
          price: data.price || "0",
          royalty: data.royalty || "2.5"
        }
      };

      // In production, upload metadata to IPFS
      const tokenURI = `ipfs://mock/${Date.now()}`;

      // Mint NFT
      console.log("Minting NFT...");
      const tx = await contract.mint(ownerAddress, tokenURI);
      const receipt = await tx.wait();

      // Get token ID from event
      const event = receipt.logs[0];
      const tokenId = event.args[2].toString();

      console.log(`NFT minted with token ID: ${tokenId}`);

      // Create NFT object
      const nft: NFT = {
        id: tokenId,
        name: data.name,
        description: data.description || "",
        image: imageUrl,
        owner: ownerAddress,
        creator: ownerAddress,
        tokenURI: tokenURI,
        createdAt: new Date().toISOString(),
        price: data.price || "0",
        currency: "ETH",
        category: data.category || "art",
        collection: data.collection || "My Collection",
        views: 0,
        likes: 0,
        chainId: chainId,
      };

      // Store in local storage for immediate access
      const existingNFTs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existingNFTs, nft]));

      // Create transaction record
      const transaction: Transaction = {
        hash: receipt.hash,
        from: ethers.ZeroAddress,
        to: ownerAddress,
        tokenId,
        timestamp: new Date().toISOString(),
        type: "mint",
        chainId: chainId,
      };

      // Store transaction
      const existingTxs = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "[]");
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([...existingTxs, transaction]));

      return nft;
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      throw new Error(error.message || "Failed to mint NFT");
    }
  },

  // Transfer NFT - simulate blockchain transfer
  transferNFT: async (
    from: string,
    to: string,
    tokenId: string
  ): Promise<boolean> => {
    try {
      // Simulate blockchain transfer
      const existingNFTs = JSON.parse(localStorage.getItem("nfts") || "[]");
      const nftIndex = existingNFTs.findIndex((nft: NFT) => nft.id === tokenId);

      if (nftIndex === -1) {
        throw new Error("NFT not found");
      }

      const nft = existingNFTs[nftIndex];

      if (nft.owner.toLowerCase() !== from.toLowerCase()) {
        throw new Error("Not the owner of this NFT");
      }

      // Get current network information
      const { chainId } = await getNetworkInfo();

      // Update owner
      nft.owner = to;
      existingNFTs[nftIndex] = nft;
      localStorage.setItem("nfts", JSON.stringify(existingNFTs));

      // Create transfer transaction
      const txHash = `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`;
      const transaction: Transaction = {
        hash: txHash,
        from,
        to,
        tokenId,
        timestamp: new Date().toISOString(),
        type: "transfer",
        blockNumber: Math.floor(Date.now() / 1000), // Simulated block number
        gasUsed: (Math.floor(Math.random() * 100000) + 50000).toString(), // Simulated gas used
        confirmations: 1,
        chainId: chainId,
      };

      const existingTxs = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );
      localStorage.setItem(
        "transactions",
        JSON.stringify([...existingTxs, transaction])
      );

      // Log the operation
      console.log(
        `Transferred NFT ${tokenId} from ${from} to ${to} on chain ${chainId}`
      );

      return true;
    } catch (error: any) {
      console.error("Error transferring NFT:", error);
      throw new Error(error.message || "Failed to transfer NFT");
    }
  },

  // Get NFTs owned by address
  getNFTsByOwner: async (ownerAddress: string): Promise<NFT[]> => {
    // For demo, use local storage data
    return localNFTService.getNFTsByOwner(ownerAddress);
  },

  // Get a specific NFT by ID
  getNFTById: async (tokenId: string): Promise<NFT | null> => {
    // For demo, use local storage data
    return localNFTService.getNFTById(tokenId);
  },

  // Get all transactions for an NFT
  getNFTTransactions: async (tokenId: string): Promise<Transaction[]> => {
    // For demo, use local storage data
    return localNFTService.getTransactionsByNFT(tokenId);
  },

  // Get all transactions for a specific user address
  getTransactionsByAddress: async (address: string): Promise<Transaction[]> => {
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]"
    );
    return transactions.filter(
      (tx: Transaction) =>
        tx.from.toLowerCase() === address.toLowerCase() ||
        tx.to.toLowerCase() === address.toLowerCase()
    );
  },

  // Get gas price
  getGasPrice: async (): Promise<string> => {
    try {
      const provider = await getProvider();
      const gasPrice = await provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, "gwei");
    } catch (error) {
      console.error("Error getting gas price:", error);
      return "0";
    }
  },
};
