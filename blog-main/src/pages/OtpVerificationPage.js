import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import api from "../api";
import { useLocation, useNavigate } from "react-router-dom";

const OtpVerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state;

  const handleVerifyOtp = async () => {
    try {
      const res = await api.post("/user/verify-otp", { ...userData, otp });
      setSnackbar({ open: true, message: res.data.message, severity: "success" });
      navigate("/login");
    } catch (err) {
      setSnackbar({ open: true, message: "Invalid OTP", severity: "error" });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f0f0f0">
      <Paper sx={{ p: 4, width: 350, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>Verify OTP</Typography>
        <TextField fullWidth label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} margin="normal" />
        <Button fullWidth variant="contained" color="primary" onClick={handleVerifyOtp}>
          Verify & Register
        </Button>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OtpVerificationPage;
