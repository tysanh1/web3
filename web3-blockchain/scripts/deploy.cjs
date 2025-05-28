console.log("INFURA_ID:", process.env.INFURA_KEY);
const hre = require("hardhat");

async function main() {
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const contract = await MyNFT.deploy("MyCollection", "MCL");
  await contract.waitForDeployment();

  console.log("✅ Contract deployed at:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});