import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // import context
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
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext); // use context
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleProfileClose();
    navigate("/login");
  };

  const navItems = [
    { label: "Signup", path: "/signup" },
    { label: "Login", path: "/login" },
  ];

  const drawer = (
    <Box sx={{ textAlign: "center", bgcolor: "#f9f9f9", height: "100%" }}>
      <Typography
        variant="h6"
        sx={{ my: 2, fontWeight: "bold", color: "#00695c", cursor: "pointer" }}
        onClick={() => {
          navigate("/");
          setMobileOpen(false);
        }}
      >
        EssenceRadio
      </Typography>
      <Divider />
      <List>
        {user ? (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ textAlign: "center" }}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        ) : (
          navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                sx={{ textAlign: "center", "&:hover": { backgroundColor: "#e0f2f1" } }}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ background: "#FFF8E7", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
              color: "#00695c",
              "&:hover": { color: "#b2dfdb" },
            }}
            onClick={() => navigate("/")}
          >
            EssenceRadio
          </Typography>

          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2, alignItems: "center" }}>
            {!user ? (
              <Button
                variant="outlined"
                sx={{ backgroundColor: "#009688", color: "#fff", fontWeight: "bold", textTransform: "none", borderRadius: "20px", px: 3 }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            ) : (
              <>
                <IconButton onClick={handleProfileClick}>
                  <Avatar sx={{ bgcolor: "#009688" }}>{user.fullname?.[0]?.toUpperCase()}</Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileClose}>
                  <MenuItem disabled>{user.fullname}</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </Box>

          <IconButton color="#009688" edge="start" sx={{ display: { xs: "block", sm: "none" } }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: 220, boxShadow: "0px 2px 10px rgba(0,0,0,0.15)" } }}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
