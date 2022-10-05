import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useAccount, useNetwork, useSigner } from "wagmi";


import ClaimTransfer from "./ClaimTransferUsingCustomPersonalSign";
import { RelayerWallet } from "../contracts/utils/RelayerWalletUtils";
import { ITransferDetails } from "../types/interfaces";

function log(text: string, val:any){
  console.log(text)
  console.log(val)
}

const useStyles = makeStyles({
  paper: {
    padding: 10,
  },
});

export default function InboundDepositsList(): JSX.Element {
  const classes = useStyles();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  log("Address", address)
  log("chain", chain)
  log("signer", signer)

  const [inboundDeposits, setInboundDeposits] = useState<ITransferDetails[]>(
    []
  );

  useEffect(() => {
    try {
      (async () => {
        //@ts-ignore
        if(signer)
        {const relayerWallet = new RelayerWallet(signer);
        const deposits = await relayerWallet.getDepositsByReceiver(
          address as string
        );
        console.log(deposits)
        setInboundDeposits(deposits);
      }else{
        log("null signer", signer)
      }
      })();
    } catch (e) {
      console.error("Failed to fetch inbound deposits: ", e);
    }
  }, [address, chain]);

  return (
    <Paper className={classes.paper}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="h5">Transfers done to you</Typography>
            </Grid>
          </Grid>
        </Grid>
        {inboundDeposits.map((props) => (
          <Grid item xs={12} key={props.id.toNumber()}>
            <ClaimTransfer {...props} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
