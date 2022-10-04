import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Navbar from "./components/Navbar";
import Body from "./components/TabsBody";
import { ToastContainer } from 'react-toastify';
import CreateTransfer from "./components/CreateTransfer";
import InboundDepositsList from "./components/ClaimTransfersList"


const App: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.bgCover}>
      <Navbar />
      <CreateTransfer />
      <InboundDepositsList />
      <ToastContainer />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  bgCover: {
    backgroundColor: "#fffef6",
    // backgroundImage: `url(img/bg.png)`,
    // backgroundSize: "cover",
    width: "100%",
    minHeight: "100vh",
  },
}));

export default App;
