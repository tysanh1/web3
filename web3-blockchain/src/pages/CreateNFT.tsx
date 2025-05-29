import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { nftService } from "@/services/nftService";
import { useWeb3 } from "@/context/Web3Context";
import { useNavigate } from "react-router-dom";

const CreateNFT = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    royalty: "",
    collection: "",
  });
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { account } = useWeb3();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image for your NFT",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const nftData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        collection: formData.collection,
        price: formData.price,
        image: imageFile,
      };

      const newNFT = await nftService.createNFT(nftData, account);

      toast({
        title: "NFT Created Successfully!",
        description: `${newNFT.name} has been minted and listed for ${newNFT.price} ${newNFT.currency}`,
      });

      navigate(`/my-assets?new=${newNFT.id}`);

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        royalty: "",
        collection: "",
      });
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast({
        title: "Error",
        description: "Failed to create NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New NFT</h1>

          <Card>
            <CardHeader>
              <CardTitle>NFT Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label>Artwork</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter NFT name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your NFT"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="collectibles">
                          Collectibles
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Collection</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("collection", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="my-collection">
                          My Collection
                        </SelectItem>
                        <SelectItem value="crypto-punks">
                          CryptoPunks
                        </SelectItem>
                        <SelectItem value="bored-apes">Bored Apes</SelectItem>
                        <SelectItem value="azuki">Azuki</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (ETH)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="0.00"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="royalty">Royalty (%)</Label>
                    <Input
                      id="royalty"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.royalty}
                      onChange={(e) =>
                        handleInputChange("royalty", e.target.value)
                      }
                      placeholder="2.5"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-web3-gradient"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating NFT..." : "Create NFT"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
