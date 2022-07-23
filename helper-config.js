const { ethers } = require("hardhat");

const networkConfig = {
  4: {
    name: "rinkeby",
  },
  31337: {
    name: "hardhat",
  },
};

const developmentChains = ["hardhat", "localhost"];
const INITIAL_SUPPLY = (10e18).toString();

module.exports = { developmentChains, networkConfig, INITIAL_SUPPLY };
