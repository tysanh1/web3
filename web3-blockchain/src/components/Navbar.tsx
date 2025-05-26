
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { QrCode, Search, Plus } from 'lucide-react';

const Navbar = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const connectWallet = async () => {
    try {
      console.log('Connecting to MetaMask...');
      
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
      }
      
      setIsWalletConnected(true);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  return (
    <nav className="border-b border-gray-800 backdrop-blur-md bg-black/90 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <img src="https://picsum.photos/id/237/40/40" alt="NFT Nexus" className="w-10 h-10 rounded-full mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">NFT Nexus</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors">
              Explore
            </Link>
            <Link to="/create" className="text-gray-300 hover:text-white transition-colors">
              Create
            </Link>
            <Link to="/myassets" className="text-gray-300 hover:text-white transition-colors">
              My Assets
            </Link>
            <Link to="/analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </Link>

          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full text-gray-300">
            <Search size={20} />
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full text-gray-300">
            <Link to="/qrcode">
              <QrCode size={20} />
            </Link>
          </Button>

          <Link to="/create">
            <Button variant="ghost" size="icon" className="rounded-full text-gray-300">
              <Plus size={20} />
            </Button>
          </Link>
          
          {isWalletConnected ? (
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full px-4 py-2"
            >
              Connected
            </Button>
          ) : (
            <Button 
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full px-4 py-2"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
