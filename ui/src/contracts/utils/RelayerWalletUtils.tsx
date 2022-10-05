import {ethers} from "ethers";
import {RelayerWalletABI, CONTRACT_ADDRESS} from "../abi/RelayerWalletCustomPersSig";

import type {TransferMode, ITransferDetails} from "../../types/interfaces";

let abi = require('ethereumjs-abi')



export class RelayerWallet {
    signer: ethers.Signer;
    contract: ethers.Contract;

    constructor(signer: ethers.Signer){
        this.signer = signer
        this.contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            RelayerWalletABI,
            this.signer
          );
    }

    createEthTransfer = async (
        _recepient: string,
        _lockingTime: number,
        value: ethers.BigNumber
      ) => {
        console.log(`_lockingTime: ${_lockingTime}`)
        const txn = await this.contract.depositEther(
            _recepient,
            _lockingTime,
          {
            value,
          }
        );
        console.log(txn);
        const rc = await txn.wait()
        console.log(rc)
      };


    createTokenTransfer = async (
      _recepient: string,
      _lockingTime: number,
      tokenAddress: string,
      value: ethers.BigNumber
    ) => {
      console.log(`approval done now calling deposit token`)
      console.log(`_recepient: ${_recepient}`)
      console.log(`tokenAddress: ${tokenAddress}`)
      console.log(`_lockingTime: ${_lockingTime}`)
      console.log(`value: ${value}`)
      const txn = await this.contract.depositToken( _recepient, _lockingTime, tokenAddress, value, {gasLimit: 1e6});
      console.log(txn);
      const rc = await txn.wait()
      console.log(rc)
    };

      withdrawEther = async (
        id: ethers.BigNumber
      ) => {
        const txn = await this.contract.withdrawEther(id, {gasLimit: 1e6});
        console.log(txn);
        let rc = await txn.wait();
        console.log(rc)
      }

      getDepositsByReceiver = async (
        userAddress: string | null | undefined
      ) => {
        return (await this.contract.getTransfersForARecepient(userAddress)).map(
          ([
            id,
            lockingTime,
            currentTime,
            amountEther,
            amountToken,
            sender,
            recepient,
            tokenAddress,
            mode,
            isActive
          ]: [
            ethers.BigNumber,
            ethers.BigNumber,
            ethers.BigNumber,
            ethers.BigNumber,
            ethers.BigNumber,
            string,
            string,
            string | null,
            TransferMode,
            boolean
          ]) => ({
            id,
            lockingTime,
            currentTime,
            amountEther,
            amountToken,
            sender,
            recepient,
            tokenAddress,
            mode,
            isActive
          })
        );
      }

      // sendSignedTransaction = async (
      //   id: any,
      //   userAddress: string | null | undefined
      // ) => {
      //   try {
      //     console.log("Sending meta transaction");
          
      //     let nonce = await this.contract.methods.getNonce(userAddress).call();
      //     console.log(`nonce: ${nonce}`)
      //     let functionSignature = this.contract.methods.withdrawEther(id, userAddress).encodeABI();
      //     console.log(`functionSignature: ${functionSignature}`)

      //     let messageToSign = constructMetaTransactionMessage(nonce, 5, functionSignature, '0x6863F12EA6A16b9ACBd7210ee2CA5C369A9629a0');

      //     // NOTE: We are using walletWeb3 here to get signature from connected wallet
      //     const signature = await this.signer.signMessage(
      //     "0x" + messageToSign.toString("hex"),
      //     userAddress
      //     );
          
      //     // NOTE: Using walletWeb3 here, as it is connected to the wallet where user account is present.
      //     let { r, s, v } = getSignatureParameters(signature);

      //     let tx = this.contract.methods
      //       .executeMetaTransaction(userAddress, functionData, r, s, v)
      //       .send({
      //           from: userAddress
      //       });
      //   console.log(tx)
      //   let rc = await tx.wait();
      //   console.log(rc)
      // } catch (error) {
      //     console.log(error);
      // }
      // }

      

}
const constructMetaTransactionMessage = (nonce: any, chainId: any, functionSignature: any, contractAddress: any) => {
  return abi.soliditySHA3(
      ["uint256","address","uint256","bytes"],
      [nonce, contractAddress, chainId, functionSignature]
  );
}