
import React from 'react';
import Navbar from '@/components/Navbar';
import QRCodeGenerator from '@/components/QRCodeGenerator';

const QRCodePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">QR Code Generator</h1>
        
        <div className="max-w-md mx-auto">
          <p className="text-muted-foreground text-center mb-8">
            Generate QR codes for NFTs or any URL to easily share with others
          </p>
          
          <QRCodeGenerator />
        </div>
      </main>
      
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 NFTMarket. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QRCodePage;
