const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Deploy NFT contract
  console.log("Deploying NFT contract...");
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await MyNFT.deploy("NFT Collection", "NFTC");
  await nft.waitForDeployment();
  
  const nftAddress = await nft.getAddress();
  console.log("✅ NFT Contract deployed to:", nftAddress);

  // Update contract addresses
  const contractAddresses = {
    MyNFT: nftAddress,
    NFTMarketplace: "0x0000000000000000000000000000000000000000" // Will be updated when marketplace is deployed
  };

  // Ensure the contracts directory exists
  const contractsDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Write contract addresses
  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("Contract addresses updated in frontend config");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });