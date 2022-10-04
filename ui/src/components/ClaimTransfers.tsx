import { Button, Box, Typography, CircularProgress } from "@material-ui/core";

import { ITransferDetails, TransferMode } from "../types/interfaces";


export default function ClaimTransfers(props: ITransferDetails) {

    const onPress = async () => {
        console.log("You are stupid");
    }

    return(
        <Button variant="contained" color="primary" onClick={onPress}>
              Submit
        </Button>
    );
}