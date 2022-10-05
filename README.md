# Relayer Wallet

A timelock wallet which deposits funds from a user for some time and then transfers it to the recepient after some specified time. The claim function uses meta-transactions from biconomy and verification of the signature takes place on-chain. This means anyone can submit the transaction with the users's signature and address. I have implemented both methods for gasless meta-transactions i.e. using EIP 2771 Approach and Custom Implementation using `BasicMetaTransaction.sol`.

A video explanation is available at: https://drive.google.com/drive/folders/1ogHKgo207mirYbCblcFtP4Qmc55fNyHk?usp=sharing

Verified smart contracts: https://goerli.etherscan.io/address/0x3c3CA5CC1E2dA4c091Ba1b91224711aA46B0773E#code
