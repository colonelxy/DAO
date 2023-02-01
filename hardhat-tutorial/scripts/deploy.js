const { ethers } = require("hardhat");
const { NFT_CONTRACT_ADRRESS} = require("../constants");

async function main() {
  const FakeNFTMarketplace = await ethers.getContractFactory("FakeNFTMarketplace");

  const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
  await fakeNftMarketplace.deployed();

  console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);

  const CryptoDevsDAO = await ethers.getContractFactory("CryptoDevsDAO");
  const cryptoDevsDAO = await CryptoDevsDAO.deploy(fakeNftMarketplace.address, NFT_CONTRACT_ADRRESS, 
    {
      value: ethers.utils.parseEther("0.05"),
    });

    await cryptoDevsDAO.deployed();

    console.log("CryptoDevsDAO deployed to: ", cryptoDevsDAO.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});