import React, { useState, useEffect, useContext } from "react";
import { Button, Box, Typography, CircularProgress } from "@material-ui/core";
import { Link, Backdrop, makeStyles } from "@material-ui/core";
import { ethers } from "ethers";
import { useAccount, useNetwork, useSigner } from "wagmi";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import LinearProgress from "@material-ui/core/LinearProgress";
import { Decimal } from "decimal.js";
import Countdown from "react-countdown";

import { RelayerWallet } from "../contracts/utils/RelayerWalletUtils";
import { ERC20Token } from "../contracts/utils/TokenUtils";

import { ITransferDetails, TransferMode } from "../types/interfaces";
import {CONTRACT_ADDRESS} from "../contracts/constants"

import {
  configEIP2771 as config,
  ExternalProvider
} from "../utils";

import {RelayerWalletABI} from "../contracts/abi/RelayerWallet";

const { Biconomy } = require("@biconomy/mexa");

let biconomy: any;


function log(text: string, val:any){
  console.log(text)
  console.log(val)
}

export default function ClaimTransfer(props: ITransferDetails) {

    console.log(`props`)
    console.log(props)

  const classes = useStyles();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");
  const [newQuote, setNewQuote] = useState("");
  const [metaTxEnabled] = useState(true);
  const [transactionHash, setTransactionHash] = useState("");

  const [decimals, setDecimals] = useState<number>(0);
  const [displayAmount, setDisplayAmount] = useState<Decimal | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false)

  // useEffect(() => {
  //   const initBiconomy = async () => {
  //     setBackdropOpen(true);
  //     console.log("Initializing Biconomy ...");
  //     // biconomy = new Biconomy(window.ethereum as ExternalProvider, {
  //     //   apiKey: 'eQwuYx0G-.e6b44858-daed-4e0a-a7be-322b3eda2b15',
  //     //   debug: true,
  //     //   contractAddresses: [CONTRACT_ADDRESS],
  //     // });
  //     // await biconomy.init();

  //     setBackdropOpen(false);
  //   };
  //   console.log(`chain: ${chain}`)
  //   if (address && chain && signer?.provider) initBiconomy();
  // }, [address, chain, signer?.provider]);

  useEffect(() => {
    (async () => {
      try {
        if (props.mode === 0) {
          setDecimals(18);
          setDisplayAmount(new Decimal(ethers.utils.formatUnits((props.amountToken).toString(), "18")))
          console.log(new Decimal(ethers.utils.formatUnits((props.amountToken).toString(), "18")).toFixed())
          console.log(`setDisplayAmount:${displayAmount}`)
        } 
        else {
          //@ts-ignore
          const erc20token = new ERC20Token(signer, props.tokenAddress);
          console.log("await erc20token.getDecimals()")
          var d: number = (await erc20token.getDecimals())
          console.log(d)
          setDecimals(d);
          setDisplayAmount(new Decimal(ethers.utils.formatUnits((props.amountToken).toString(), d.toString())))
          console.log(new Decimal(ethers.utils.formatUnits((props.amountToken).toString(), d.toString())).toFixed())
          console.log(`setDisplayAmount:${displayAmount}`)

        }
        
      } catch (e) {
        console.log("Error retrieving decimals: ", e);
        setDecimals(0);
      }
    })();
  }, [props, address, chain, signer?.provider]);

    //   useEffect(() => {
    //     console.log(`decimals: ${decimals}`)
    //   if (decimals != null) {
    //     setDisplayAmount(
    //       new Decimal(props.amountEther.toString()).div(
    //         new Decimal(10).pow(decimals)
    //       )
    //     );
    //   } else {
    //     setDisplayAmount(null);
    //   }
    // }, [decimals]);

  const onClick = async () => {
   
    if (metaTxEnabled) {
      console.log("Initializing Biconomy ...");
      console.log("window.ethereum")
      console.log(window.ethereum as ExternalProvider)
      biconomy = new Biconomy(window.ethereum as ExternalProvider, {
        apiKey: 'eQwuYx0G-.e6b44858-daed-4e0a-a7be-322b3eda2b15',
        debug: true,
        contractAddresses: [CONTRACT_ADDRESS],
      });
      await biconomy.init();
      log("bic here", biconomy)
      sendTransaction(address!, props.id);
    } else {
      console.log(" No met txn");
      // let tx = await contract.setQuote(newQuote, {
      //   from: address,
      // });
      // setTransactionHash(tx.transactionHash);
      // tx = await tx.wait(1);
      // console.log(tx);
    
    }
  };

  const getDataForToken = async (userAddress: string, id: ethers.BigNumber, contractInstance: ethers.Contract) => {
    let  {data}  = await contractInstance.populateTransaction.withdrawToken(id.toString());
    let txParams = {
      data: data,
      to: CONTRACT_ADDRESS,
      from: userAddress,
      signatureType: "EIP712_SIGN",
    };
    return txParams
  }

  const getDataForEther = async (userAddress: string, id: ethers.BigNumber, contractInstance: ethers.Contract) => {
    let  {data}  = await contractInstance.populateTransaction.withdrawEther(id);
    let txParams = {
      data: data,
      to: CONTRACT_ADDRESS,
      from: userAddress,
      signatureType: "EIP712_SIGN",
    };
    return txParams
  }

  const sendTransaction = async (userAddress: string, id: ethers.BigNumber) => {
    try {
      console.log(`Sending transaction via Biconomy`);
      const provider = await biconomy.provider;
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        RelayerWalletABI,
        biconomy.ethersProvider
      );
      // let data;
      console.log(`id: ${id} and userAddress: ${userAddress}`)
      // if(props.mode === 0){
      //   data  = await contractInstance.populateTransaction.withdrawEther(id);
      // }else{
      //  let  {data}  = await contractInstance.populateTransaction.withdrawToken(id.toString(), userAddress);
      // }
      let txParams;

      if(props.mode === 0){
        txParams = await getDataForEther(userAddress, id, contractInstance)
      } else {
        txParams = await getDataForToken(userAddress, id, contractInstance)
      }
     
      
      // let txParams = {
      //   data: data,
      //   to: CONTRACT_ADDRESS,
      //   from: userAddress,
      //   signatureType: "EIP712_SIGN",
      // };
      const tx = await provider.send("eth_sendTransaction", [txParams]);
      console.log(tx);
      biconomy.on("txHashGenerated", (data: any) => {
        console.log(data);
        console.log(`tx hash ${data.hash}`);
      });
      biconomy.on("txMined", (data: any) => {
        console.log(data);
        console.log(`tx mined ${data.hash}`);
      });
      setClaimed(true);
    } catch (error) {
      console.log(error);
    }
  };
  


  return (
    <Card className={classes.root} variant="outlined">
      <CardContent className={classes.content}>
      <Typography variant="h6" component="h2">
          {displayAmount != null && <>{displayAmount.toString()}</>}{" "}
          {props.mode === 0
            ? "ETH"
            : "Tokens"}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Deposit ID: {props.id.toString()}
          <br />
          Sender: {props.sender}
        </Typography>
        {props.mode === 1 && (
          <Typography className={classes.pos} color="textSecondary">
            Token Address: {props.tokenAddress}
          </Typography>
        )}
        <Typography variant="body2" component="p" className={classes.p}>
          {!props.isActive ? (
            "Claimed"
          ) : (
            <>
              {`Deposit can be claimed after ${new Date(
                props.lockingTime.toNumber() * 1000 + props.currentTime.toNumber() * 1000
              ).toLocaleString()}`}
              <br />
              Time Remaining:{" "}
              <Countdown
                date={
                  new Date(
                    props.lockingTime.toNumber() * 1000 + props.currentTime.toNumber() * 1000
                  )
                }
              />
            </>
          )}
        </Typography>
        {claimed || (
        <Button variant="contained" color="primary" onClick={onClick}>
              Submit
        </Button>)}
      </CardContent>
      
      {loading && <LinearProgress />}

    </Card>

    

    
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
  title: {
    fontSize: 14,
  },
  pos: {
    fontSize: 14,
  },
  p: {
    marginTop: 10,
  },
  content: {
    paddingBottom: 0,
  },
}));