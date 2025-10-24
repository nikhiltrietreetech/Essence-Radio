import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Link,
  CircularProgress,
} from "@mui/material";
import { useNavigate,Link as RouterLink, } from "react-router-dom";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";

import api from "../api";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    mobile: "",
    email: "",
    otp: "",
    password: "",
  });
  const [step, setStep] = useState(1); // 1=details, 2=OTP, 3=password
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
     e.preventDefault();
    if (!formData.email || !formData.fullname || !formData.mobile)
      return setSnackbar({ open: true, message: "Fill all fields", severity: "warning" });
    try {
      setLoading(true);
      const res = await api.post("/user/send-otp", { email: formData.email });
      setSnackbar({ open: true, message: res.data.message || "OTP sent!", severity: "success" });
      setStep(2);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to send OTP", severity: "error" });
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!formData.otp)
      return setSnackbar({ open: true, message: "Enter OTP", severity: "warning" });
    try {
      setLoading(true);
      const res = await api.post("/user/verify-otp", { email: formData.email, otp: formData.otp });
      setSnackbar({ open: true, message: res.data.message || "OTP verified!", severity: "success" });
      setStep(3);
    } catch (err) {
      setSnackbar({ open: true, message: "Invalid OTP", severity: "error" });
    } finally { setLoading(false); }
  };

  // Step 3: Register
  const handleRegister = async () => {
    if (!formData.password)
      return setSnackbar({ open: true, message: "Enter password", severity: "warning" });
    try {
      setLoading(true);
      const res = await api.post("/user/register", formData);
      setSnackbar({ open: true, message: res.data.message || "Registered!", severity: "success" });
      navigate("/login");
    } catch (err) {
      setSnackbar({ open: true, message: "Registration failed", severity: "error" });
    } finally { setLoading(false); }
  };
  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255,255,255,0.6)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#92FE9D",
      },
    },
    "& input": {
      color: "#fff",
    },
    "& label": {
      color: "rgba(255,255,255,0.7)",
    },
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
            background: "rgba(255,255,255,0.15)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 3, color: "#fff", letterSpacing: 1 }}
          >
            Signup 
          </Typography>
          <Typography variant="body1" align="center" color="rgba(255,255,255,0.8)" mb={3}>
                      Already  have an account?{" "}
                      <Link component={RouterLink} to="/login" sx={{ color: "#FFD700" }}>
                        Login
                      </Link>
                    </Typography>

          {step === 1 && (
            <Box>
            <Typography sx={{ color: "#fff", fontWeight: "bold", textAlign:'start' }}>Full Name </Typography>
              <TextField
                fullWidth
                margin="normal"
                
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                sx={textFieldStyle}                
                required
              />
              <Typography sx={{ color: "#fff", fontWeight: "bold", textAlign:'start' }}>Mobile </Typography>
              <TextField
                fullWidth
                margin="normal"
                
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                sx={textFieldStyle}                
                required
              />
              <Typography sx={{ color: "#fff", fontWeight: "bold", textAlign:'start' }}>Email </Typography>
              <TextField
                fullWidth
                margin="normal"

                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={textFieldStyle}               
                required
              />
              <Button
                fullWidth
                variant="contained"
                 type="button"  
                onClick={handleSendOtp}
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
                  color: "#000",
                  "&:hover": { background: "linear-gradient(90deg, #92FE9D 0%, #00C9FF 100%)" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <TextField
                fullWidth
                margin="normal"
                label="Enter OTP"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.8)" } }}
                InputProps={{ style: { color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingLeft: 12 } }}
                required
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
                  color: "#000",
                  "&:hover": { background: "linear-gradient(90deg, #92FE9D 0%, #00C9FF 100%)" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
              </Button>
            </Box>
          )}

          {step === 3 && (
            <Box>
            <TextField
  fullWidth
  margin="normal"
  label="Create Password"
  name="password"
  type={showPassword ? "text" : "password"}
  value={formData.password}
  onChange={handleChange}
  InputLabelProps={{ style: { color: "rgba(255,255,255,0.8)" } }}
  InputProps={{
    style: { color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingLeft: 12 },
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowPassword((prev) => !prev)}
          edge="end"
          sx={{ color: "#fff" }}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
  required
/>

              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
                  color: "#000",
                  "&:hover": { background: "linear-gradient(90deg, #92FE9D 0%, #00C9FF 100%)" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
              </Button>
            </Box>
          )}
        </Box>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SignupPage;