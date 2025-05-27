// web.js - API Express dùng ether.js + mint NFT + IPFS
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const { provider, wallet, loadNFTContract } = require("./ether");
const { create } = require("ipfs-http-client");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// IPFS cấu hình
const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("🚀 Sepolia Ethereum NFT API is running!");
});

app.get("/balance/:address", async (req, res) => {
  try {
    const balance = await provider.getBalance(req.params.address);
    res.json({
      address: req.params.address,
      balance: ethers.formatEther(balance) + " ETH"
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid address" });
  }
});

app.get("/network", async (req, res) => {
  const network = await provider.getNetwork();
  res.json({
    chainId: Number(network.chainId),
    name: network.name
  });
});

app.post("/transfer", async (req, res) => {
  const { to, amount } = req.body;
  try {
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    await tx.wait();
    res.json({ status: "success", hash: tx.hash });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload ảnh lên IPFS và mint NFT
app.post("/mint", upload.single("file"), async (req, res) => {
  try {
    const fileData = fs.readFileSync(req.file.path);
    const uploaded = await ipfs.add(fileData);
    const tokenURI = `https://ipfs.io/ipfs/${uploaded.path}`;

    const contract = loadNFTContract();
    const tx = await contract.mint(tokenURI);
    await tx.wait();

    fs.unlinkSync(req.file.path); // xóa file tạm
    res.json({ status: "minted", tokenURI, txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 NFT Web3 API listening at http://localhost:${PORT}`);
});
