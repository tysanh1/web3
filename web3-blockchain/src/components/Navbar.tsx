import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Search, Plus } from 'lucide-react';
import { useWeb3 } from '@/context/Web3Context';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { SUPPORTED_NETWORKS } from '@/context/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  LogOut, 
  User, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  Check,
  CircleDollarSign
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



const Navbar = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
    const { 
    account, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    isConnected,
    chainId,
    balance,
    switchNetwork,
    network
  } = useWeb3();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openBlockExplorer = () => {
    if (account && network) {
      const explorerUrl = `${network.blockExplorer}/address/${account}`;
      window.open(explorerUrl, '_blank');
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
          {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Network indicator */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${network?.isTestnet ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      <span className="hidden md:inline max-w-[100px] truncate">{network?.name || 'Unknown'}</span>
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.values(SUPPORTED_NETWORKS).map(network => (
                      <DropdownMenuItem 
                        key={network.chainId} 
                        onClick={() => switchNetwork(network.chainId)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${network.isTestnet ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                          {network.name}
                          {network.chainId === chainId && <Check className="ml-2 h-4 w-4 text-green-500" />}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
           {/* Wallet dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CircleDollarSign className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="hidden md:inline">
                        {account?.substring(0, 6)}...{account?.substring(38)}
                      </span>
                      <span className="md:hidden">
                        {account?.substring(0, 4)}...
                      </span>
                      <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Wallet</DropdownMenuLabel>
                    {balance && (
                      <div className="px-2 py-1 text-sm">
                        <span className="font-medium">{parseFloat(balance).toFixed(4)} {network?.currency || 'ETH'}</span>
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={copyAddress}>
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? "Copied!" : "Copy Address"}
                    </DropdownMenuItem>
                    {network?.blockExplorer && (
                      <DropdownMenuItem className="cursor-pointer" onClick={openBlockExplorer}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Explorer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={disconnectWallet}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-web3-purple hover:bg-web3-deep-purple"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )
            }
        
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
