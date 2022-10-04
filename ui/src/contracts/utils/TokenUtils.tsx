import {ethers} from "ethers";
import {MockERC20ABI} from "../abi/MockERC20";


export class ERC20Token {
    signer: ethers.Signer;
    erc20address: string;
    contract: ethers.Contract;

    constructor(signer: ethers.Signer, erc20address: string){
        this.signer = signer
        this.erc20address = erc20address
        this.contract = new ethers.Contract(
            erc20address,
            MockERC20ABI,
            this.signer
          );
    }

    balanceOf = async (user: string) => {
        return await this.contract.balanceOf(user);
    }

    approve = async (to: string, value: ethers.BigNumber) => {
        let txn = await this.contract.approve(to, value);
        console.log(txn);
        let rc = await txn.wait();
        console.log(rc);
    }

    getDecimals = async () => {
        return await this.contract.decimals();
    }
}