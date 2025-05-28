const ethers = require('ethers');
require('dotenv').config();

const NFT_CONTRACT_ABI = require('../abi/NFTcontract.json');
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

async function main() {
    // Connect to provider (e.g. MetaMask)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    
    // Get contract instance
    const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
    );

    // Example interactions:
    
    // 1. Get collection name and symbol
    const name = await nftContract.name();
    const symbol = await nftContract.symbol();
    console.log(`Collection Name: ${name}`);
    console.log(`Collection Symbol: ${symbol}`);

    // 2. Mint new NFT
    const tokenURI = "ipfs://your_metadata_uri_here";
    const mintTx = await nftContract.mint(tokenURI);
    const receipt = await mintTx.wait();
    console.log(`Minted NFT with transaction hash: ${receipt.transactionHash}`);

    // 3. Get token owner
    const tokenId = 1; // replace with your token ID
    const owner = await nftContract.ownerOf(tokenId);
    console.log(`Owner of token ${tokenId}: ${owner}`);

    // 4. Get user's NFT balance
    const address = await signer.getAddress();
    const balance = await nftContract.balanceOf(address);
    console.log(`Your NFT balance: ${balance.toString()}`);

    // 5. Transfer NFT
    const toAddress = "RECIPIENT_ADDRESS_HERE";
    const transferTx = await nftContract.transferFrom(address, toAddress, tokenId);
    await transferTx.wait();
    console.log(`Transferred token ${tokenId} to ${toAddress}`);
}

// Error handling wrapper
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 