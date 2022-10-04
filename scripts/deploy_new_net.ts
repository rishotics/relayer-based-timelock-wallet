import { ethers } from 'hardhat'

async function main() {
  const RelayerWallet = await ethers.getContractFactory('RelayerWallet')
  const relayerWallet = await RelayerWallet.deploy('0xE041608922d06a4F26C0d4c27d8bCD01daf1f792')

  await relayerWallet.deployed()

  console.log(`relayerWallet successfully deployed to ${relayerWallet.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
