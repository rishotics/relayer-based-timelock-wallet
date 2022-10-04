import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";

import TextField from "@material-ui/core/TextField";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import { makeStyles } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useAccount, useNetwork, useSigner } from "wagmi";

import { Decimal } from "decimal.js";
import { ethers } from "ethers";
import {TransferMode} from '../types/interfaces'
import {RelayerWallet} from '../contracts/utils/RelayerWalletUtils'
import { ERC20Token } from "../contracts/utils/TokenUtils";
import {CONTRACT_ADDRESS} from "../contracts/constants"

import dotenv from "dotenv";

dotenv.config({ path: "../../env.local" });


export default function CreateTransfer(): JSX.Element{

    const classes = useStyles();
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const [receiverAddress, setReceiverAddress] = useState<string>("");
    const [transferMode, setTransferMode] = useState<TransferMode>(TransferMode.EthMode);
    const [transferAmount, setTransferAmount] = useState<number>(0);
    const [erc20address, setErc20address] = useState<string>("");
    const [lastDate, setlastDate] = useState<Date>(new Date());
    const [currentUserBalance, setCurrentUserBalance] = useState<Decimal>(new Decimal(0));
    const [loading, setLoading] = useState<boolean>(false);

    console.log(`signer: ${signer}`)
    console.log(`address: ${address}`)

    const toIsoString = (date: Date): string => {
        var tzo = -date.getTimezoneOffset(),
          dif = tzo >= 0 ? "+" : "-",
          pad = function (num: number) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? "0" : "") + norm;
          };
    
        return (
          date.getFullYear() +
          "-" +
          pad(date.getMonth() + 1) +
          "-" +
          pad(date.getDate()) +
          "T" +
          pad(date.getHours()) +
          ":" +
          pad(date.getMinutes()) +
          ":" +
          pad(date.getSeconds()) +
          dif +
          pad(tzo / 60) +
          ":" +
          pad(tzo % 60)
        );
      };

    const createEthTransfer = async () => {
        try {
          const actualTokenAmount = ethers.BigNumber.from(
            new Decimal(transferAmount).mul(new Decimal(10).pow(18)).toFixed()
          );

          console.log("signer")
          console.log(signer)
          //@ts-ignore
          const relayerWallet = new RelayerWallet(signer);
          
          await relayerWallet.createEthTransfer(
            receiverAddress as string,
            Math.floor((lastDate?.getTime() as number) / 1000) - Math.floor(((new Date())?.getTime() as number) / 1000),
            actualTokenAmount
          );
            
          
          // window.location.reload(false);
        } catch (e) {
          console.error("Error Creating ERC20 Deposit: ", e);
        }
      };

    const createTokenTransfer = async () => {
      try {
        if (erc20address === ''){
          console.log("Empty token address");
          return <div>Error</div>
        }
        console.log(`choose token transfer`)
        console.log(`erc20: ${erc20address}`)
        //@ts-ignore
        const erc20token = new ERC20Token(signer, erc20address);
        const decimals = await erc20token.getDecimals();
        //@ts-ignore
        const balance = await erc20token.balanceOf(address.toString());
        console.log(`balance: ${balance}`)

        console.log(`decimals: ${decimals}`)
        const actualTokenAmount = ethers.BigNumber.from(
          new Decimal(transferAmount).mul(new Decimal(10).pow(decimals)).toFixed()
        );

        console.log(`ethers.utils.parseEther(transferAmount.toString()): ${ethers.utils.parseEther(transferAmount.toString())}`)

        console.log(`process.env.CONTRACT_ADDRESS: ${CONTRACT_ADDRESS}`)
        await erc20token.approve(CONTRACT_ADDRESS as string, ethers.utils.parseEther(transferAmount.toString()));

        console.log("signer")
        console.log(signer)
        //@ts-ignore
        const relayerWallet = new RelayerWallet(signer);
        
        await relayerWallet.createTokenTransfer(
          receiverAddress as string,
          Math.floor((lastDate?.getTime() as number) / 1000) - Math.floor(((new Date())?.getTime() as number) / 1000),
          erc20address,
          ethers.utils.parseEther(transferAmount.toString())
        );
          
        
        // window.location.reload(false);
      } catch (e) {
        console.error("Error Creating ERC20 Deposit: ", e);
      }
    };


      return (
        <div className="createTransfer ">
            <div className="card card-body m-auto mt-3" style={{ maxWidth: "600px"}}>
                <h2>Create Transfer</h2>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Receiver address</label>
                    <input className="form-control" id="name" onChange={(e) => setReceiverAddress(e.target.value)}/>
                </div>
                <FormControl>
                    <RadioGroup
                    value={
                        {
                        [TransferMode.EthMode]: "EthMode",
                        [TransferMode.TokenMode]: "TokenMode",
                        }[transferMode]
                    }
                    onChange={(event) =>
                        setTransferMode(
                        {
                            //@ts-ignore
                            EthMode: TransferMode.EthMode,
                            TokenMode: TransferMode.TokenMode,
                        }[event.target.value] as TransferMode
                        )
                    }
                    >
                    <Grid container>
                        <Grid item>
                        <FormControlLabel
                            value="EthMode"
                            control={<Radio />}
                            label="EthMode"
                        />
                        </Grid>
                        <Grid item>
                        <FormControlLabel
                            value="TokenMode"
                            control={<Radio />}
                            label="TokenMode"
                        />
                        </Grid>
                    </Grid>
                    </RadioGroup>
                </FormControl>
                {transferMode === TransferMode.TokenMode && (
                  <TextField
                  autoFocus
                  margin="dense"
                  label="Token"
                  type="text"
                  fullWidth
                  onChange={(event) => setErc20address(event.target.value)}
                  required
                />
                )}
                <TextField
                    autoFocus
                    margin="dense"
                    label="Unlock Date"
                    type="datetime-local"
                    defaultValue={toIsoString(new Date()).slice(0, 19)}
                    fullWidth
                    onChange={(event) => setlastDate(new Date(event.target.value))}
                    required
                    helperText="Must be in future"
                    error={lastDate.getTime() < new Date().getTime()}
                />

                <div className="mb-3">
                    <label htmlFor="prize" className="form-label">Transfer Amount </label>
                    <input className="form-control" id="prize" type="number" onChange={(e) => setTransferAmount(parseFloat(e.target.value))}/>
                </div>

                {
                    !loading
                        ?<button className="btn btn-primary mb-3" onClick={async( )=> {
                          await {
                            [TransferMode.EthMode]: createEthTransfer,
                            [TransferMode.TokenMode]: createTokenTransfer,
                          }[transferMode]();
                          }}>
                            Create
                        </button>
                        : <p>Loading....</p>
                }
            </div>  
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px",
  },
  main: {
    padding: 20,
    height: "100%",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
    opacity: ".85!important",
    background: "#000",
  },
}));