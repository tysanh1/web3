
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MetaMaskConnectProps {
  onConnect: (address: string) => void;
}

const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({ onConnect }) => {
  const { toast } = useToast();

  const connectToMetaMask = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get the first account
        const address = accounts[0];
        onConnect(address);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask extension to connect your wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-border rounded-xl bg-card">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
        alt="MetaMask Logo" 
        className="w-16 h-16" 
      />
      <h2 className="text-xl font-semibold">Connect to MetaMask</h2>
      <p className="text-center text-muted-foreground mb-4">
        Connect your wallet to access the NFT marketplace features
      </p>
      <Button onClick={connectToMetaMask} className="bg-web3-gradient w-full">
        Connect Wallet
      </Button>
    </div>
  );
};

export default MetaMaskConnect;
