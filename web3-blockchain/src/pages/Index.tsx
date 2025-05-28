
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import MetaMaskConnect from '@/components/MetaMaskConnect';

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnect = (address: string) => {
    setIsWalletConnected(true);
    setWalletAddress(address);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background -z-10" />
          
          <div className="container mx-auto px-4 py-24 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="web3-gradient-text">NFT Marketplace</span> for Digital Creators
              </h1>
              <p className="text-lg mb-8 text-muted-foreground">
                Discover, collect, and sell extraordinary NFTs. The world's first and largest NFT marketplace.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/marketplace">
                  <Button className="bg-web3-gradient">
                    Explore Marketplace
                  </Button>
                </Link>
                <Link to="/create">
                  <Button variant="outline">
                    Create NFT
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* <div className="md:w-1/2 flex justify-center">
              {!isWalletConnected ? (
                <MetaMaskConnect onConnect={handleConnect} />
              ) : (
                <div className="p-6 border border-border rounded-xl bg-card text-center animate-glow">
                  <h2 className="text-xl font-semibold mb-2">Wallet Connected</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                  </p>
                  <Link to="/marketplace">
                    <Button className="bg-web3-gradient">
                      Explore NFTs
                    </Button>
                  </Link>
                </div>
              )}
            </div> */}
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold mb-3">NFT Marketplace</h3>
                <p className="text-muted-foreground">
                  Buy, sell and discover exclusive digital items
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold mb-3">NFT Transfers</h3>
                <p className="text-muted-foreground">
                  Transfer ownership between users seamlessly
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold mb-3">NFT Categories</h3>
                <p className="text-muted-foreground">
                  Filter and categorize NFTs for better discovery
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold mb-3">Mobile Responsive</h3>
                <p className="text-muted-foreground">
                  Optimized experience for mobile devices
                </p>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold mb-3">Data Analytics</h3>
                <p className="text-muted-foreground">
                  Track and visualize your NFT collection data
                </p>
              </div>
              
              {/* Feature 6 */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold mb-3">QR Code Integration</h3>
                <p className="text-muted-foreground">
                  Share and access NFTs quickly with QR codes
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-xl font-bold web3-gradient-text mb-4">NFTMarket</h2>
            <p className="text-muted-foreground mb-4">
              Discover, collect, and sell extraordinary NFTs
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 NFTMarket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
