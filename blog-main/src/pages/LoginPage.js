import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Link,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";
import api from "../api"; // axios instance
import { AuthContext } from "../context/AuthContext"; // Auth context

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // use context login
  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
  const [useOtp, setUseOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Handle input changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Toggle login method
  const handleToggleLoginMethod = () => {
    setUseOtp(!useOtp);
    setFormData({ ...formData, password: "", otp: "" });
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!formData.email) {
      setSnackbar({ open: true, message: "Enter your email", severity: "warning" });
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/user/send-otp", { email: formData.email });
      setSnackbar({ open: true, message: res.data.message || "OTP sent!", severity: "success" });
      setUseOtp(true);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to send OTP", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || (!useOtp && !formData.password) || (useOtp && !formData.otp)) {
      setSnackbar({ open: true, message: "Fill required fields", severity: "warning" });
      return;
    }

    try {
      setLoading(true);
      let res;

      if (useOtp) {
        res = await api.post("/user/login-otp", { email: formData.email, otp: formData.otp });
      } else {
        res = await api.post("/user/login", { email: formData.email, password: formData.password });
      }

      // Save user in context & localStorage
      login(res.data.user);

      setSnackbar({ open: true, message: "Login successful", severity: "success" });

      navigate("/essenceRadio"); // redirect after login
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Login failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00695c 0%, #283593 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: 450 }}
      >
        <Box
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 3,
            backdropFilter: "blur(12px)",
            background: "rgba(255, 255, 255, 0.15)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            color: "#fff",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" sx={{ mb: 3, color: "#fff" }}>
            Login
          </Typography>

          <Typography variant="body1" align="center" color="rgba(255,255,255,0.8)" mb={3}>
            Don&apos;t have an account?{" "}
            <Link component={RouterLink} to="/signup" sx={{ color: "#FFD700" }}>
              Sign up
            </Link>
          </Typography>

          <Box component="form" onSubmit={handleLogin}>
            {/* Email */}
            <TextField
              label="Email"
              placeholder="Enter your email"
              fullWidth
              margin="normal"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="off"
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.8)" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#FFD700" }} />
                  </InputAdornment>
                ),
                style: { color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingLeft: 12 },
              }}
            />

            {/* Password or OTP */}
            {!useOtp ? (
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                fullWidth
                margin="normal"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.8)" } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#FFD700" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff sx={{ color: "#FFD700" }} /> : <Visibility sx={{ color: "#FFD700" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: { color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingLeft: 12 },
                }}
              />
            ) : (
              <>
                <TextField
                  label="OTP"
                  placeholder="Enter the OTP"
                  fullWidth
                  margin="normal"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ style: { color: "rgba(255,255,255,0.8)" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIphoneIcon sx={{ color: "#FFD700" }} />
                      </InputAdornment>
                    ),
                    style: { color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingLeft: 12 },
                  }}
                />
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  size="small"
                  sx={{
                    mt: 1,
                    mb: 2,
                    borderColor: "#FFD700",
                    color: "#FFD700",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "rgba(255,215,0,0.2)" },
                  }}
                  variant="outlined"
                >
                  Send OTP
                </Button>
              </>
            )}

            {/* Remember Me & Forgot Password */}
            <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
              <FormControlLabel
                control={<Checkbox size="small" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} sx={{ color: "#FFD700" }} />}
                label="Remember me"
              />
              <Link component={RouterLink} to="/forgot-password" sx={{ color: "#FFD700" }}>
                Forgot password?
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                py: 1.5,
                background: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
                color: "#000",
                fontWeight: "bold",
                borderRadius: 3,
                textTransform: "none",
                "&:hover": { background: "linear-gradient(90deg, #92FE9D 0%, #00C9FF 100%)" },
              }}
            >
              {useOtp ? "Login with OTP" : "Login with Password"}
            </Button>

            {/* Toggle Login Method */}
            <Button
              fullWidth
              onClick={handleToggleLoginMethod}
              sx={{
                mt: 2,
                color: "black",
                fontWeight: "bold",
                borderColor: "#FFD700",
                borderRadius: 3,
                textTransform: "none",
                "&:hover": { background: "linear-gradient(90deg, #92FE9D 0%, #00C9FF 100%)" },
              }}
              variant="outlined"
            >
              {useOtp ? "Switch to Password Login" : "Use OTP Login Instead"}
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
