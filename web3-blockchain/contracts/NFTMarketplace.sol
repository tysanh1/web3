// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTMarketplace
 * @dev Hợp đồng marketplace cho phép tạo, mua, bán lại, đấu giá NFT và các tính năng tương tác.
 */
contract NFTMarketplace is Ownable, ReentrancyGuard {
    // Địa chỉ của hợp đồng NFT
    MyNFT public nftContract;

    // Phí niêm yết NFT
    uint256 public listingPrice;

    // Cấu trúc để lưu trữ thông tin bán hàng trực tiếp
    struct Sale {
        address payable seller;
        uint256 price;
        bool isSold;
    }

    // Cấu trúc để lưu trữ thông tin đấu giá
    // Đã loại bỏ mapping 'bids' khỏi struct Auction
    struct Auction {
        address payable seller;
        uint256 currentBid;
        address payable highestBidder;
        uint256 endTime;
        bool started;
        bool ended;
        // mapping(address => uint256) bids; // ĐÃ BỊ XÓA - Không thể có mapping trong struct
    }

    // Cấu trúc để lưu trữ thông tin bình luận
    struct Comment {
        address commenter;
        string content;
        uint8 rating; // Đánh giá bằng số sao (1-5)
        uint256 timestamp;
    }

    // Cấu trúc để lưu trữ các thuộc tính mở rộng của NFT
    struct TokenDetails {
        string category;
        string collection;
        uint256 royaltyBasisPoints; // Tỷ lệ bản quyền, ví dụ: 250 = 2.5% (basis points)
        string descriptionIPFSHash; // Hash IPFS cho mô tả dài
    }

    // Ánh xạ từ tokenId đến thông tin bán hàng
    mapping(uint256 => Sale) public idToSale;
    // Ánh xạ từ tokenId đến thông tin đấu giá
    mapping(uint256 => Auction) public idToAuction;
    // Ánh xạ riêng để lưu trữ các bid của từng đấu giá
    mapping(uint256 => mapping(address => uint256)) public auctionBids; 
    // Ánh xạ từ tokenId đến số lượt xem
    mapping(uint256 => uint256) public tokenViews;
    // Ánh xạ từ tokenId đến số lượt thích
    mapping(uint256 => uint256) public tokenLikes;
    // Ánh xạ từ tokenId đến mảng các bình luận
    mapping(uint256 => Comment[]) public tokenComments;
    // Ánh xạ từ tokenId đến các thuộc tính mở rộng của NFT
    mapping(uint256 => TokenDetails) public tokenExtendedDetails;
    // Ánh xạ từ tokenId đến địa chỉ đã like (để tránh like nhiều lần từ cùng một địa chỉ)
    mapping(uint256 => mapping(address => bool)) private likedBy;


    // --- Events (để The Graph lập chỉ mục) ---

    /**
     * @dev Được phát ra khi một NFT mới được tạo thông qua marketplace.
     * @param tokenId ID của NFT.
     * @param owner Địa chỉ của người tạo NFT.
     * @param uri URI metadata của NFT.
     * @param category Thể loại của NFT.
     * @param collection Bộ sưu tập của NFT.
     * @param royaltyBasisPoints Tỷ lệ bản quyền (basis points).
     * @param descriptionIPFSHash Hash IPFS của mô tả dài.
     */
    event NFTCreated(
        uint256 indexed tokenId,
        address indexed owner,
        string uri,
        string category,
        string collection,
        uint256 royaltyBasisPoints,
        string descriptionIPFSHash
    );

    /**
     * @dev Được phát ra khi một NFT được niêm yết để bán trực tiếp.
     * @param tokenId ID của NFT.
     * @param seller Địa chỉ của người bán.
     * @param price Giá niêm yết.
     */
    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    /**
     * @dev Được phát ra khi một NFT được mua.
     * @param tokenId ID của NFT.
     * @param buyer Địa chỉ của người mua.
     * @param seller Địa chỉ của người bán.
     * @param price Giá mua.
     */
    event NFTSold(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    /**
     * @dev Được phát ra khi một NFT được bán lại.
     * @param tokenId ID của NFT.
     * @param seller Địa chỉ của người bán lại.
     * @param newPrice Giá bán lại.
     */
    event NFTResold(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 newPrice
    );

    /**
     * @dev Được phát ra khi một phiên đấu giá bắt đầu.
     * @param tokenId ID của NFT.
     * @param seller Địa chỉ của người bán.
     * @param minBid Giá khởi điểm đấu giá.
     * @param endTime Thời gian kết thúc đấu giá.
     */
    event AuctionStarted(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 minBid,
        uint256 endTime
    );

    /**
     * @dev Được phát ra khi một bid được đặt trong đấu giá.
     * @param tokenId ID của NFT.
     * @param bidder Địa chỉ của người đặt bid.
     * @param amount Số tiền bid.
     */
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );

    /**
     * @dev Được phát ra khi một phiên đấu giá kết thúc.
     * @param tokenId ID của NFT.
     * @param winner Địa chỉ của người thắng đấu giá.
     * @param finalPrice Giá cuối cùng của đấu giá.
     */
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 finalPrice
    );

    /**
     * @dev Được phát ra khi tỷ lệ bản quyền của NFT được cập nhật.
     * @param tokenId ID của NFT.
     * @param newRoyaltyBasisPoints Tỷ lệ bản quyền mới (basis points).
     */
    event RoyaltyUpdated(
        uint256 indexed tokenId,
        uint256 newRoyaltyBasisPoints
    );

    /**
     * @dev Được phát ra khi lượt xem của NFT tăng lên.
     * @param tokenId ID của NFT.
     * @param newViewCount Tổng số lượt xem mới.
     */
    event ViewIncremented(
        uint256 indexed tokenId,
        uint256 newViewCount
    );

    /**
     * @dev Được phát ra khi lượt thích của NFT tăng lên.
     * @param tokenId ID của NFT.
     * @param newLikeCount Tổng số lượt thích mới.
     */
    event LikeIncremented(
        uint256 indexed tokenId,
        uint256 newLikeCount
    );

    /**
     * @dev Được phát ra khi một bình luận được thêm vào NFT.
     * @param tokenId ID của NFT.
     * @param commenter Địa chỉ của người bình luận.
     * @param content Nội dung bình luận.
     * @param rating Đánh giá sao.
     * @param timestamp Thời gian bình luận.
     */
    event CommentAdded(
        uint256 indexed tokenId,
        address indexed commenter,
        string content,
        uint8 rating,
        uint256 timestamp
    );

    /**
     * @dev Được phát ra khi phí niêm yết được cập nhật.
     * @param newListingPrice Giá niêm yết mới.
     */
    event ListingPriceUpdated(uint256 newListingPrice);

    /**
     * @dev Khởi tạo hợp đồng marketplace.
     * @param _nftContractAddress Địa chỉ của hợp đồng MyNFT đã triển khai.
     * @param _listingPrice Phí niêm yết ban đầu cho mỗi NFT.
     */
    constructor(address _nftContractAddress, uint256 _listingPrice) Ownable(msg.sender) {
        nftContract = MyNFT(_nftContractAddress);
        listingPrice = _listingPrice;
    }

    /**
     * @dev Cập nhật phí niêm yết. Chỉ chủ sở hữu hợp đồng marketplace mới có thể gọi.
     * @param _newListingPrice Phí niêm yết mới.
     */
    function updateListingPrice(uint256 _newListingPrice) public onlyowner {
        listingPrice = _newListingPrice;
        emit ListingPriceUpdated(_newListingPrice);
    }

    /**
     * @dev Rút phí niêm yết đã thu được. Chỉ chủ sở hữu hợp đồng marketplace mới có thể gọi.
     */
    function withdrawListingPrice() public onlyowner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Tạo một NFT mới thông qua marketplace.
     * Người gọi phải gửi listingPrice cùng với giao dịch.
     * @param _uri URI metadata của NFT (hash IPFS).
     * @param _category Thể loại của NFT (ví dụ: "Art", "Gaming").
     * @param _collection Bộ sưu tập của NFT.
     * @param _royaltyBasisPoints Tỷ lệ bản quyền cho người tạo (ví dụ: 250 cho 2.5%).
     * @param _descriptionIPFSHash Hash IPFS cho mô tả dài của NFT.
     * @return tokenId ID của NFT vừa được tạo.
     */
    function createNFT(
        string memory _uri,
        string memory _category,
        string memory _collection,
        uint256 _royaltyBasisPoints,
        string memory _descriptionIPFSHash
    ) public payable nonReentrant returns (uint256) {
        require(msg.value == listingPrice, "Must pay listing price");
        
        // Mint NFT thông qua hợp đồng MyNFT
        uint256 newItemId = nftContract.mintNFT(msg.sender, _uri, address(this));

        // Lưu trữ các thuộc tính mở rộng
        tokenExtendedDetails[newItemId] = TokenDetails({
            category: _category,
            collection: _collection,
            royaltyBasisPoints: _royaltyBasisPoints,
            descriptionIPFSHash: _descriptionIPFSHash
        });

        emit NFTCreated(
            newItemId,
            msg.sender,
            _uri,
            _category,
            _collection,
            _royaltyBasisPoints,
            _descriptionIPFSHash
        );
        return newItemId;
    }

    /**
     * @dev Niêm yết một NFT để bán trực tiếp.
     * Người bán phải approve hợp đồng marketplace để chuyển NFT.
     * @param _tokenId ID của NFT cần niêm yết.
     * @param _price Giá bán.
     */
    function listNFTForSale(uint256 _tokenId, uint256 _price) public nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        require(nftContract.ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");
        require(nftContract.getApproved(_tokenId) == address(this), "Marketplace not approved to transfer NFT");
        require(idToAuction[_tokenId].ended || !idToAuction[_tokenId].started, "NFT is currently in an active auction");
        
        idToSale[_tokenId] = Sale({
            seller: payable(msg.sender),
            price: _price,
            isSold: false
        });

        // Đảm bảo không có đấu giá đang hoạt động cho NFT này
        if (idToAuction[_tokenId].started) {
            delete idToAuction[_tokenId]; // Xóa thông tin đấu giá nếu có
        }

        emit NFTListed(_tokenId, msg.sender, _price);
    }

    /**
     * @dev Mua một NFT đang được niêm yết để bán trực tiếp.
     * Người mua phải gửi số tiền bằng giá niêm yết.
     * @param _tokenId ID của NFT cần mua.
     */
    function buyNFT(uint256 _tokenId) public payable nonReentrant {
        Sale storage sale = idToSale[_tokenId];
        require(sale.seller != address(0), "NFT is not listed for sale");
        require(!sale.isSold, "NFT has already been sold");
        require(msg.value == sale.price, "Please submit the asking price");
        require(sale.seller != msg.sender, "Cannot buy your own NFT");
 
        // Chuyển NFT cho người mua
        nftContract.transferFrom(sale.seller, msg.sender, _tokenId);

        // Xử lý bản quyền (nếu có) và gửi tiền cho người bán
        TokenDetails storage details = tokenExtendedDetails[_tokenId];
        uint256 royaltyAmount = (msg.value * details.royaltyBasisPoints) / 10000; // 10000 basis points = 100%
        uint256 sellerProceeds = msg.value - royaltyAmount;

        // Gửi tiền bản quyền cho người tạo ban đầu của NFT (nếu có)
        // Lưu ý: MyNFT.ownerOf(_tokenId) sẽ trả về chủ sở hữu hiện tại của NFT,
        // không phải người tạo ban đầu. Để tính đúng royalty cho người tạo ban đầu,
        // bạn cần lưu trữ địa chỉ người tạo ban đầu trong TokenDetails hoặc một mapping khác.
        // Hiện tại, nó sẽ gửi royalty cho chủ sở hữu hiện tại của NFT.
        // Nếu bạn muốn gửi cho người tạo ban đầu, bạn cần thêm một trường `originalowner`
        // vào `TokenDetails` khi NFT được tạo.
        address currentNFTowner = nftContract.ownerOf(_tokenId); // Lấy chủ sở hữu hiện tại của NFT
        if (royaltyAmount > 0) {
            (bool royaltySent, ) = payable(currentNFTowner).call{value: royaltyAmount}("");
            require(royaltySent, "Failed to send royalty");
        }

        // Gửi tiền cho người bán
        (bool sellerSent, ) = sale.seller.call{value: sellerProceeds}("");
        require(sellerSent, "Failed to send funds to seller");

        sale.isSold = true;
        delete idToSale[_tokenId]; // Xóa niêm yết sau khi bán

        emit NFTSold(_tokenId, msg.sender, sale.seller, msg.value);
    }

    /**
     * @dev Bán lại một NFT đã sở hữu.
     * Người bán phải approve hợp đồng marketplace để chuyển NFT.
     * @param _tokenId ID của NFT cần bán lại.
     * @param _newPrice Giá bán lại mới.
     */
    function resellNFT(uint256 _tokenId, uint256 _newPrice) public {
        require(_newPrice > 0, "New price must be greater than 0");
        require(nftContract.ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");
        require(nftContract.getApproved(_tokenId) == address(this), "Marketplace not approved to transfer NFT");
        require(idToAuction[_tokenId].ended || !idToAuction[_tokenId].started, "NFT is currently in an active auction");

        // Cập nhật thông tin niêm yết hiện có hoặc tạo mới
        idToSale[_tokenId] = Sale({
            seller: payable(msg.sender),
            price: _newPrice,
            isSold: false
        });
    const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
        // Đảm bảo không có đấu giá đang hoạt động cho NFT này
        if (idToAuction[_tokenId].started) {
            delete idToAuction[_tokenId];
        }

        emit NFTResold(_tokenId, msg.sender, _newPrice);
    }

    /**
     * @dev Bắt đầu một phiên đấu giá cho NFT.
     * Người bán phải approve hợp đồng marketplace để chuyển NFT.
     * @param _tokenId ID của NFT cần đấu giá.
     * @param _minBid Giá khởi điểm đấu giá.
     * @param _duration Thời gian đấu giá tính bằng giây.
     */
    function startAuction(uint256 _tokenId, uint256 _minBid, uint256 _duration) public nonReentrant {
        require(nftContract.ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");
        require(nftContract.getApproved(_tokenId) == address(this), "Marketplace not approved to transfer NFT");
        require(_minBid > 0, "Minimum bid must be greater than 0");
        require(_duration > 0, "Auction duration must be greater than 0");
        require(!idToAuction[_tokenId].started, "Auction already started for this NFT");
        require(idToSale[_tokenId].seller == address(0) || idToSale[_tokenId].isSold, "NFT is currently listed for direct sale");

        idToAuction[_tokenId] = Auction({
            seller: payable(msg.sender),
            currentBid: _minBid,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + _duration,
            started: true,
            ended: false
        });

        // Xóa thông tin niêm yết bán trực tiếp nếu có
        if (idToSale[_tokenId].seller != address(0)) {
            delete idToSale[_tokenId];
        }

        emit AuctionStarted(_tokenId, msg.sender, _minBid, block.timestamp + _duration);
    }

    /**
     * @dev Đặt bid trong một phiên đấu giá.
     * Người đặt bid phải gửi số tiền lớn hơn bid hiện tại.
     * @param _tokenId ID của NFT đang đấu giá.
     */
    function placeBid(uint256 _tokenId) public payable nonReentrant {
        Auction storage auction = idToAuction[_tokenId];
        require(auction.started, "Auction has not started");
        require(!auction.ended, "Auction has ended");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.sender != auction.seller, "Seller cannot place bids");
        require(msg.value > auction.currentBid, "Bid must be higher than current bid");

        // Hoàn trả bid trước đó cho người đặt bid cao nhất cũ
        if (auction.highestBidder != payable(address(0))) {
            // Sử dụng mapping auctionBids riêng biệt để hoàn trả
            (bool success, ) = auction.highestBidder.call{value: auctionBids[_tokenId][auction.highestBidder]}("");
            require(success, "Failed to refund previous bidder");
        }

        auction.currentBid = msg.value;
        auction.highestBidder = payable(msg.sender);
        auctionBids[_tokenId][msg.sender] = msg.value; // Lưu bid của người hiện tại vào mapping riêng

        emit BidPlaced(_tokenId, msg.sender, msg.value);
    }

    /**
     * @dev Kết thúc một phiên đấu giá và chuyển NFT cho người thắng.
     * Chỉ có thể gọi sau khi thời gian đấu giá kết thúc.
     * @param _tokenId ID của NFT đấu giá.
     */
    function endAuction(uint256 _tokenId) public nonReentrant {
        Auction storage auction = idToAuction[_tokenId];
        require(auction.started, "Auction has not started");
        require(!auction.ended, "Auction has already ended");
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");

        auction.ended = true;

        if (auction.highestBidder == payable(address(0))) {
            // Không có bid nào được đặt, NFT trở về người bán
            // Không cần chuyển NFT vì nó vẫn thuộc về người bán
            emit AuctionEnded(_tokenId, address(0), 0);
        } else {
            // Chuyển NFT cho người thắng đấu giá
            nftContract.transferFrom(auction.seller, auction.highestBidder, _tokenId);

            // Xử lý bản quyền và gửi tiền cho người bán
            TokenDetails storage details = tokenExtendedDetails[_tokenId];
            uint256 royaltyAmount = (auction.currentBid * details.royaltyBasisPoints) / 10000;
            uint256 sellerProceeds = auction.currentBid - royaltyAmount;

            // Gửi tiền bản quyền cho người tạo ban đầu của NFT (hoặc chủ sở hữu hiện tại nếu không có trường originalowner)
            address currentNFTowner = nftContract.ownerOf(_tokenId); // Lấy chủ sở hữu hiện tại của NFT
            if (royaltyAmount > 0) {
                (bool royaltySent, ) = payable(currentNFTowner).call{value: royaltyAmount}("");
                require(royaltySent, "Failed to send royalty");
            }

            // Gửi tiền cho người bán
            (bool sellerSent, ) = auction.seller.call{value: sellerProceeds}("");
            require(sellerSent, "Failed to send funds to seller");

            emit AuctionEnded(_tokenId, auction.highestBidder, auction.currentBid);
        }
        delete idToAuction[_tokenId]; // Xóa thông tin đấu giá
        // Cũng nên xóa các bid liên quan đến đấu giá này để giải phóng storage
        // Tuy nhiên, việc xóa toàn bộ mapping con là không thể trong Solidity.
        // Bạn có thể đặt lại các giá trị về 0 nếu cần, hoặc chấp nhận rằng chúng sẽ tồn tại.
        // Để đơn giản, chúng ta sẽ không cố gắng xóa tất cả các bid cụ thể ở đây.
    }

    /**
     * @dev Cập nhật tỷ lệ bản quyền cho một NFT.
     * Chỉ người tạo ban đầu của NFT hoặc chủ sở hữu hợp đồng marketplace mới có thể gọi.
     * @param _tokenId ID của NFT.
     * @param _newRoyaltyBasisPoints Tỷ lệ bản quyền mới (basis points).
     */
    function updateRoyalty(uint256 _tokenId, uint256 _newRoyaltyBasisPoints) public {
        // Chỉ cho phép người tạo ban đầu của NFT hoặc chủ hợp đồng marketplace cập nhật bản quyền
        require(nftContract.ownerOf(_tokenId) == msg.sender || owner() == msg.sender, "Only original owner or marketplace owner can update royalty");
        require(_newRoyaltyBasisPoints <= 10000, "Royalty cannot exceed 100%"); // 10000 basis points = 100%

        tokenExtendedDetails[_tokenId].royaltyBasisPoints = _newRoyaltyBasisPoints;
        emit RoyaltyUpdated(_tokenId, _newRoyaltyBasisPoints);
    }

    /**
     * @dev Tăng số lượt xem của một NFT.
     * Có thể được gọi bởi bất kỳ ai.
     * @param _tokenId ID của NFT.
     */
    function incrementView(uint256 _tokenId) public {
        tokenViews[_tokenId]++;
        emit ViewIncremented(_tokenId, tokenViews[_tokenId]);
    }

    /**
     * @dev Tăng số lượt thích của một NFT.
     * Mỗi địa chỉ chỉ có thể thích một lần.
     * @param _tokenId ID của NFT.
     */
    function toggleLike(uint256 _tokenId) public {
        if (!likedBy[_tokenId][msg.sender]) {
            tokenLikes[_tokenId]++;
            likedBy[_tokenId][msg.sender] = true;
            emit LikeIncremented(_tokenId, tokenLikes[_tokenId]);
        } else {
            revert("Already liked this NFT");
        }
    }

    /**
     * @dev Thêm một bình luận và đánh giá sao cho một NFT.
     * @param _tokenId ID của NFT.
     * @param _content Nội dung bình luận.
     * @param _rating Đánh giá sao (1-5).
     */
    function addComment(uint256 _tokenId, string memory _content, uint8 _rating) public {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        
        tokenComments[_tokenId].push(Comment({
            commenter: msg.sender,
            content: _content,
            rating: _rating,
            timestamp: block.timestamp
        }));
        emit CommentAdded(_tokenId, msg.sender, _content, _rating, block.timestamp);
    }

    // --- Hàm đọc dữ liệu (View functions) ---

    /**
     * @dev Lấy thông tin bán hàng của một NFT.
     * @param _tokenId ID của NFT.
     * @return seller Địa chỉ người bán.
     * @return price Giá niêm yết.
     * @return isSold Trạng thái đã bán.
     */
    function getSaleDetails(uint256 _tokenId) public view returns (address seller, uint256 price, bool isSold) {
        Sale storage sale = idToSale[_tokenId];
        return (sale.seller, sale.price, sale.isSold);
    }

    /**
     * @dev Lấy thông tin đấu giá của một NFT.
     * @param _tokenId ID của NFT.
     * @return seller Địa chỉ người bán.
     * @return currentBid Giá bid hiện tại.
     * @return highestBidder Địa chỉ người đặt bid cao nhất.
     * @return endTime Thời gian kết thúc.
     * @return started Trạng thái đã bắt đầu.
     * @return ended Trạng thái đã kết thúc.
     */
    function getAuctionDetails(uint256 _tokenId) public view returns (
        address seller,
        uint256 currentBid,
        address highestBidder,
        uint256 endTime,
        bool started,
        bool ended
    ) {
        Auction storage auction = idToAuction[_tokenId];
        return (
            auction.seller,
            auction.currentBid,
            auction.highestBidder,
            auction.endTime,
            auction.started,
            auction.ended
        );
    }

    /**
     * @dev Lấy bid của một địa chỉ cụ thể trong một phiên đấu giá.
     * @param _tokenId ID của NFT đấu giá.
     * @param _bidder Địa chỉ của người đặt bid.
     * @return amount Số tiền bid của người đó.
     */
    function getAuctionBid(uint256 _tokenId, address _bidder) public view returns (uint256) {
        return auctionBids[_tokenId][_bidder];
    }

    /**
     * @dev Lấy tất cả bình luận cho một NFT.
     * @param _tokenId ID của NFT.
     * @return commentsArray Mảng các bình luận.
     */
    function getComments(uint256 _tokenId) public view returns (Comment[] memory commentsArray) {
        return tokenComments[_tokenId];
    }

    /**
     * @dev Lấy các thuộc tính mở rộng của một NFT.
     * @param _tokenId ID của NFT.
     * @return category Thể loại.
     * @return collection Bộ sưu tập.
     * @return royaltyBasisPoints Tỷ lệ bản quyền.
     * @return descriptionIPFSHash Hash IPFS của mô tả.
     */
    function getTokenExtendedDetails(uint256 _tokenId) public view returns (
        string memory category,
        string memory collection,
        uint256 royaltyBasisPoints,
        string memory descriptionIPFSHash
    ) {
        TokenDetails storage details = tokenExtendedDetails[_tokenId];
        return (
            details.category,
            details.collection,
            details.royaltyBasisPoints,
            details.descriptionIPFSHash
        );
    }


}