import React from "react";
import { AppBar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  const classes = useStyles();

  return (
    <AppBar position="static" classes={{ root: classes.nav }}>
      <div className={classes.flexContainer}>
        {/* <NavLink to="/"> */}
          <img src="img/logo2.svg" alt="logo" className={classes.logo} />
        {/* </NavLink> */}
        <ConnectButton />
      </div>
    </AppBar>
  );
  // return(
  //   <AppBar position="static" classes={{ root: classes.nav }}>
  //     <Container maxWidth="xl">
  //       <Toolbar disableGutters>
  //         <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
  //         <Typography
  //           variant="h6"
  //           noWrap
  //           component="a"
  //           href="/"
  //           sx={{
  //             mr: 2,
  //             display: { xs: 'none', md: 'flex' },
  //             fontFamily: 'monospace',
  //             fontWeight: 700,
  //             letterSpacing: '.3rem',
  //             color: 'inherit',
  //             textDecoration: 'none',
  //           }}
  //         >
  //           LOGO
  //         </Typography>

  //         <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
  //           <IconButton
  //             size="large"
  //             aria-label="account of current user"
  //             aria-controls="menu-appbar"
  //             aria-haspopup="true"
  //             onClick={handleOpenNavMenu}
  //             color="inherit"
  //           >
  //             <MenuIcon />
  //           </IconButton>
  //           <Menu
  //             id="menu-appbar"
  //             anchorEl={anchorElNav}
  //             anchorOrigin={{
  //               vertical: 'bottom',
  //               horizontal: 'left',
  //             }}
  //             keepMounted
  //             transformOrigin={{
  //               vertical: 'top',
  //               horizontal: 'left',
  //             }}
  //             open={Boolean(anchorElNav)}
  //             onClose={handleCloseNavMenu}
  //             sx={{
  //               display: { xs: 'block', md: 'none' },
  //             }}
  //           >
  //             {pages.map((page) => (
  //               <MenuItem key={page} onClick={handleCloseNavMenu}>
  //                 <Typography textAlign="center">{page}</Typography>
  //               </MenuItem>
  //             ))}
  //           </Menu>
  //         </Box>
  //         <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
  //         <Typography
  //           variant="h5"
  //           noWrap
  //           component="a"
  //           href=""
  //           sx={{
  //             mr: 2,
  //             display: { xs: 'flex', md: 'none' },
  //             flexGrow: 1,
  //             fontFamily: 'monospace',
  //             fontWeight: 700,
  //             letterSpacing: '.3rem',
  //             color: 'inherit',
  //             textDecoration: 'none',
  //           }}
  //         >
  //           LOGO
  //         </Typography>
  //         <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
  //           {pages.map((page) => (
  //             <Button
  //               key={page}
  //               onClick={handleCloseNavMenu}
  //               sx={{ my: 2, color: 'white', display: 'block' }}
  //             >
  //               {page}
  //             </Button>
  //           ))}
  //         </Box>

          
  //       </Toolbar>
  //     </Container>
  //   </AppBar>
  // );
};

const useStyles = makeStyles((theme) => ({
  nav: {
    height: "70px",
    boxShadow: "none",
    background: "inherit",
    marginBottom: "40px",
    borderBottom: "2px solid black",
    "@media (max-width:1100px)": {
      padding: "0 20px",
    },
  },
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "auto",
    padding: 0,
    maxWidth: 1080,
    width: "100%",
  },
  logo: {
    height: "25px",
    marginTop: 2
  },
}));

export default Navbar;
