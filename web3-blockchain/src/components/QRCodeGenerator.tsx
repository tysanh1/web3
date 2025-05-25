
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const QRCodeGenerator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = () => {
    if (!url) return;
    
    setIsGenerating(true);
    
    // Using Google Charts API for QR code generation (for simplicity)
    const encodedUrl = encodeURIComponent(url);
    const googleChartsUrl = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodedUrl}&choe=UTF-8`;
    
    setQrCodeUrl(googleChartsUrl);
    setIsGenerating(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Enter URL or Text
          </label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        
        <div className="flex justify-center">
          {qrCodeUrl && (
            <div className="border border-border rounded-lg p-4 bg-white">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateQRCode}
          disabled={!url || isGenerating}
          className="w-full bg-web3-gradient"
        >
          {isGenerating ? "Generating..." : "Generate QR Code"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRCodeGenerator;
