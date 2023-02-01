require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path:".env" });

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const GOERLI_KEY = process.env.GOERLI_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: ALCHEMY_URL,
      accounts: [GOERLI_KEY],
    },
  },
};
