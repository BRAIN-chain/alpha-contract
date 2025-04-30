require("@nomicfoundation/hardhat-toolbox");

require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.29",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2 ** 32 - 1
      },
    },
  },
  paths: {
    sources: './contracts',
  },
  defaultNetwork: 'localhost',

  // gasReporter: {
  //   currency: 'USD',
  //   gasPrice: <PRICE>
  // }
  // gasReporter: {
  //   enabled: true
  // },

  mocha: {
    timeout: 100000000
  },

  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: 'https://eth.drpc.org',
        // url: 'https://mainnet.optimism.io',
        // url: 'https://arb1.arbitrum.io/rpc',
      },
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },

    eth: {
      url: 'https://eth.drpc.org',
    },
    op: {
      url: 'https://mainnet.optimism.io',
    },
    arb: {
      url: 'https://arb1.arbitrum.io/rpc',
    },
  },
};
