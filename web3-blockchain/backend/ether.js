// ether.js - Kết nối Ethereum Sepolia + Hỗ trợ load NFT contract
const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const INFURA_URL = `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet("0x" + PRIVATE_KEY, provider);

function loadContract(address, abi) {
  return new ethers.Contract(address, abi, wallet);
}

// Load ABI từ file (ví dụ: abi/NFTContract.json)
function loadNFTContract() {
  const abiPath = path.join(__dirname, "abi", "NFTContract.json");
  const contractABI = JSON.parse(fs.readFileSync(abiPath));
  const contract = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, contractABI, wallet);
  return contract;
}

module.exports = {
  provider,
  wallet,
  loadContract,
  loadNFTContract
};