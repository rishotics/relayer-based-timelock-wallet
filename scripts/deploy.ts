import { ethers } from "hardhat";


const currentTime = () => {
  let now = new Date();
  return Math.floor(now.getTime() / 1000);
}


async function main() {
  let now = currentTime();
  const [owner, sender, recipient1, ...addrs] = await ethers.getSigners();
  const RelayerWallet = await ethers.getContractFactory("RelayerWallet");
  const relayerWallet = await RelayerWallet.deploy();

  await relayerWallet.deployed();

  await relayerWallet.connect(sender).depositEther(recipient1.address, now + 100, {value: ethers.utils.parseEther("1")});
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
