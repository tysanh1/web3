// web.js - Ethereum Sepolia interaction API using Express + Ethers
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ====================== CONFIG ============================
const INFURA_KEY = "YOUR_INFURA_KEY_HERE"; // 🔑 Thay bằng Infura key thật
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // 🔐 Không có "0x" phía trước

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_KEY}`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// ===========================================================

// GET / - Health check
app.get("/", (req, res) => {
  res.send("🚀 Ethereum Sepolia Web3 API is running!");
});

// GET /balance/:address - Kiểm tra số dư ETH
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

// GET /network - Lấy thông tin mạng
app.get("/network", async (req, res) => {
  const network = await provider.getNetwork();
  res.json({
    chainId: Number(network.chainId),
    name: network.name
  });
});

// POST /transfer - Gửi ETH từ ví server đến ví người dùng
app.post("/transfer", async (req, res) => {
  const { to, amount } = req.body;
  try {
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    await tx.wait();
    res.json({
      status: "success",
      hash: tx.hash
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sepolia API listening at http://localhost:${PORT}`);
});
