// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MyNFT
 * @dev Hợp đồng NFT tuân thủ ERC721URIStorage để quản lý các NFT.
 * Các thuộc tính chính của NFT được lưu trữ trong metadata URI (IPFS).
 */
contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Ánh xạ từ tokenId đến địa chỉ của marketplace đã tạo NFT này
    mapping(uint256 => address) public marketplaceowner;
    mapping(uint256 => address) public originalowner;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    function mintNFT(address to, string memory uri, address marketplace) public onlyOwner returns (uint256) {
        uint256 newItemId = _tokenIdCounter;
        _tokenIdCounter++;

        _mint(to, newItemId);
        _setTokenURI(newItemId, uri);
        marketplaceowner[newItemId] = marketplace;
        originalowner[newItemId] = to;
        return newItemId;
    }

    function creatorOf(uint256 tokenId) public view returns (address) {
        return originalowner[tokenId];
    }

    /**
     * @dev Ghi đè hàm _baseURI để trả về chuỗi cơ sở cho token URI.
     * Trong trường hợp này, chúng ta không cần base URI vì mỗi token có URI riêng.
     */
    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    /**
     * @dev Chỉ cho phép marketplace đã tạo NFT này hoặc chủ sở hữu hợp đồng gọi.
     * Lưu ý: Modifier này được sử dụng trong MyNFT.sol như một ví dụ về kiểm soát quyền truy cập.
     */
    modifier onlyMarketplaceownerOrowner(uint256 _tokenId) {
        require(
            msg.sender == marketplaceowner[_tokenId] || msg.sender == owner(),
            "Not authorized to modify this NFT via marketplace."
        );
        _;
    }
}