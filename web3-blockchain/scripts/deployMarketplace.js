// deployMarketplace.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Triển khai NFT contract trước
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await MyNFT.deploy("MyCollection", "MCL");
  await nft.waitForDeployment();
  console.log("✅ MyNFT deployed to:", nft.target);

  // Triển khai Marketplace contract
  const listingPrice = hre.ethers.parseEther("0.01"); // phí tạo NFT
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const market = await NFTMarketplace.deploy(nft.target, listingPrice);
  await market.waitForDeployment();
  console.log("✅ Marketplace deployed to:", market.target);

  // Ghi địa chỉ ra file JSON để frontend dùng
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir, { recursive: true });

  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify({
      MyNFT: nft.target,
      NFTMarketplace: market.target,
    }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
