import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Analytics from "./pages/Analytics";
import QRCodePage from "./pages/QRCodePage";
import CreateNFT from "./pages/CreateNFT";
import NFTDetail from "./pages/NFTDetail";
import NotFound from "./pages/NotFound";
import MyAssets from "./pages/MyAssets";
import { Web3Provider } from "./context/Web3Context";
import { AuthProvider } from "./context/AuthContext";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
    <AuthProvider> 
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/qrcode" element={<QRCodePage />} />
          <Route path="/create" element={<CreateNFT />} />
          <Route path="/nft/:id" element={<NFTDetail />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/myassets" element={<MyAssets/>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
