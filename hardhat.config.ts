import { HardhatUserConfig, task } from 'hardhat/config'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import fs from 'fs'
import path from 'path'
import "hardhat-gas-reporter"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})


const config: HardhatUserConfig = {
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 20,
      },
    },
    compilers: [
      {
        version: '0.8.16',
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true, 
    },
  },
    gasReporter: {
    currency: 'USD',
    gasPrice: 21
  }
}

export default config
