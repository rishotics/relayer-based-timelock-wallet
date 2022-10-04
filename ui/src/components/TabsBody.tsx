/* eslint-disable react/jsx-pascal-case */
import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Ethers_EIP2771_EIP712Sign from "./Ethers_EIP2771_EIP712Sign";
// import Ethers_Forward_EIP712Sign from './Ethers_Forward_EIP712Sign';

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      className="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index: any) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    width: "100%",
    maxWidth: 900,
    margin: "auto",
    height: "max-content",
    border: "1px solid #D48158",
    borderRadius: 25,
    "@media (max-width:699px)": {
      flexDirection: "column"
    },
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: "30px 10px",
    width: "30%",
    "@media (max-width:699px)": {
      width: "90%",
      margin: "auto"
    },
  },
}));

function App() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs"
        className={classes.tabs}
      >
       
        <Tab label="Ethers + EIP2771 + EIP712 Sign" {...a11yProps(6)} />
        {/* <Tab label="Ethers + Forward + EIP712 Sign" {...a11yProps(8)} /> */}
      </Tabs>

      
      <TabPanel value={value} index={0}>
        <Ethers_EIP2771_EIP712Sign />
      </TabPanel>
    </div>
  );
}

export default App;
