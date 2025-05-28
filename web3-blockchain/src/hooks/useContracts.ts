import { useMemo } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import MyNFTABI from '../contracts/MyNFT.json';
import MarketplaceABI from '../contracts/NFTMarketplace.json';
import addressesRaw from '../contracts/contract-addresses.json';

const addresses = addressesRaw as {
  MyNFT: string;
  NFTMarketplace: string;
}

export function useContracts() {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.ethereum) return {};

    const provider = new BrowserProvider(window.ethereum);

    async function getContracts() {
      const signer = await provider.getSigner();

      const nftContract = new Contract(
        addresses.MyNFT,
        MyNFTABI.abi,
        signer
      );

      const marketplaceContract = new Contract(
        addresses.NFTMarketplace,
        MarketplaceABI.abi,
        signer
      );

      return {
        provider,
        signer,
        nftContract,
        marketplaceContract,
      };
    }

    return getContracts(); // Trả về Promise
  }, []);
}

