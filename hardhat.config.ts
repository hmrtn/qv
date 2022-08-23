import { HardhatUserConfig, task } from 'hardhat/config'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import fs from 'fs'
import path from 'path'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})

// Copy Poseidon artifacts from maci-contracts
// task('compile', 'Compiles the entire project, building all artifacts', async (_, { config }, runSuper) => {
//   await runSuper() // will remove existing poseidons files

//   const poseidons = ['PoseidonT3', 'PoseidonT6']
//   for (const contractName of poseidons) {
//     const filePath = path.join(config.paths.artifacts, `${contractName}.json`)

//     const artifact = JSON.parse(
//       fs.readFileSync(`./node_modules/maci-contracts/compiled/${contractName}.json`).toString(),
//     )
//     fs.writeFileSync(filePath, JSON.stringify({ ...artifact, linkReferences: {} }))

//     if (!fs.existsSync(filePath)) throw new Error(`Failed to copied ${contractName}`)
//   }

//   console.log('Successfully copied PoseidonT3.json and PoseidonT6.json to ./artifacts')
// })

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
      allowUnlimitedContractSize: true, // essential of maciFactory.ts
    },
  },
}

export default config