import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { label: "Signup", path: "/signup" },
    { label: "Login", path: "/login" },
  ];

  // Mobile Drawer menu
  const drawer = (
    <Box sx={{ textAlign: "center", bgcolor: "#f9f9f9", height: "100%" }}>
      <Typography
        variant="h6"
        sx={{
          my: 2,
          fontWeight: "bold",
          color: "#00695c",
          cursor: "pointer",
          fontFamily: "Poppins, sans-serif",
        }}
        onClick={() => {
          navigate("/");
          setMobileOpen(false);
        }}
      >
        EssenceRadio
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              sx={{
                textAlign: "center",
                "&:hover": { backgroundColor: "#e0f2f1" },
              }}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Top Navbar */}
      <AppBar
        position="sticky"
       sx={{
  background: "#FFF8E7", 
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
}}

      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 4 },
          }}
        >
          {/* Logo / Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
              color: "#00695c",
              fontFamily: "Poppins, sans-serif",
              "&:hover": { color: "#b2dfdb" },
              transition: "0.3s",
            }}
            onClick={() => navigate("/")}
          >
            EssenceRadio
          </Typography>

          {/* Desktop Buttons */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#009688",
                color: "#fff",
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  backgroundColor: "#00796b",
                  boxShadow: "0px 0px 10px rgba(0,150,136,0.4)",
                },
              }}
              onClick={() => navigate("/signup")}
            >
              Signup
            </Button>

            <Button
              variant="outlined"
              sx={{
              backgroundColor: "#009688",
                color: "#ffffff",
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  backgroundColor: "#00796b",
                  boxShadow: "0px 0px 10px rgba(0,150,136,0.4)",
                  color: "#b2dfdb",
                },
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            color="#009688"
            edge="start"
            sx={{ display: { xs: "block", sm: "none" } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile view */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: 220,
            boxShadow: "0px 2px 10px rgba(0,0,0,0.15)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
