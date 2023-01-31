// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoDevDAO is Ownable {
    interface IFakeNFTMarketplace {
        function getPrice() external view returns (uint256);

        function available(uint256 _tokenId) external view returns (bool);

        function purchase(uint256 _tokenId) external payable;
    }

    interface ICryptoDevsNFT {
        function balanceOf(address owner) external view returns (uint256);

        function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    }

    struct Proposal {
        uint256 nftTokenId;
        uint256 deadline;
        uint256 yayVotes;
        uint256 nayVotes;
        bool executed;
        mapping(uint256 => bool) voters;
        mapping(uint256 => Proposal) public proposals;
        uint256 public numProposals;
    }

    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;

    constructor(address _nftMarketplace, address _cryptoDevsNFT) payable {
        nftMarketplace = IFakeNFTMarketplace(_nftMarketplace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "Not a DAO member");
        _;
    }

    function createProposal(uint256 _nftTokenId) external nftHolderOnly returns (uint256) {
        require(nftMarketplace.available(_nftTokenId), "NFT not available for sale");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
        proposal.deadline = block.timestamp + 5 minutes;
        numProposals++;

        return numProposals - 1;
    }
}