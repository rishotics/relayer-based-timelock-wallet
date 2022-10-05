import { ethers } from 'hardhat'

async function main() {
  const RelayerWallet = await ethers.getContractFactory('RelayerWalletCustomPersonalSig')
  const relayerWallet = await RelayerWallet.deploy()

  await relayerWallet.deployed()

  console.log(`RelayerWalletCustomPersonalSig successfully deployed to ${relayerWallet.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
