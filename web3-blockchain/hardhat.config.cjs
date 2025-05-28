require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [`1b9fee13b61c76d6bcbab03808740a4351dad720777b8e4d06c5d3438e91e8c4`]
    }
  },
};