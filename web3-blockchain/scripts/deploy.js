const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const NFTContract = await hre.ethers.getContractFactory("NFTContract");
  
  // Deploy the contract
  const nftContract = await NFTContract.deploy();
  await nftContract.waitForDeployment();
  
  const address = await nftContract.getAddress();
  console.log("NFTContract deployed to:", address);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
console.log("INFURA_ID:", process.env.INFURA_KEY);
const hre = require("hardhat");

async function main() {
  const NFTContract = await hre.ethers.getContractFactory("MyNFT");
  const contract = await NFTContract.deploy("MyCollection", "MCL");
  await contract.waitForDeployment();

  console.log("✅ Contract deployed at:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});