import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MyNFTAbi from "src/abi/MyNFT.json";

export function useNFTContract(provider: ethers.providers.Web3Provider | null) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const address = "Địa_chỉ_contract_của_bạn";

  useEffect(() => {
    if (provider) {
      try {
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(address, MyNFTAbi, signer);
        setContract(contractInstance);
      }
       catch (error) {
        console.error("Failed to create contract instance:", error);
        setContract(null);
      }
    } else {
      setContract(null);
    }
  }, [provider]);

  return contract;
}
