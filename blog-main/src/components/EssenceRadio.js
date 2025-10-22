import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Button, Box, Grid, Paper, Card, TextField,
  IconButton, List, ListItem, ListItemText, Divider, Snackbar, Alert
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function EssenceRadio() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submittedEpisodes, setSubmittedEpisodes] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ id: 1, text: "Welcome to Essence Radio chat!", from: "system" }]);
  const [showChat, setShowChat] = useState(false);
  const chatListRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const audioRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // WebRTC states
  const [recording, setRecording] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcLocal = useRef(null);
  const pcRemote = useRef(null);
  const streamRef = useRef(null);

  const API_BASE = "http://localhost:5000"; // ✅ Change to your backend port

  const showSnackbar = (message, severity = "info") => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    
    return () => stopLive();
  }, []);

 

  const createEpisode = async (title, description) => {
    try {
      const { data } = await axios.post(`${API_BASE}/api/episodes`, { title, description });
      setSubmittedEpisodes((prev) => [...prev, data]);
      showSnackbar("Episode created successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to create episode.", "error");
    }
  };

  const updateEpisode = async (id, title, description) => {
    try {
      const { data } = await axios.put(`${API_BASE}/api/episodes/${id}`, { title, description });
      setSubmittedEpisodes((prev) => prev.map((ep) => (ep.id === id ? data : ep)));
      showSnackbar("Episode updated successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to update episode.", "error");
    }
  };

  const deleteEpisode = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/episodes/${id}`);
      setSubmittedEpisodes((prev) => prev.filter((ep) => ep.id !== id));
      showSnackbar("Episode deleted successfully", "warning");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete episode.", "error");
    }
  };

  // -------------------- Handlers --------------------
  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), text: chatInput, from: "you" }]);
    setChatInput("");
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioSrc(url);
    showSnackbar(`Loaded: ${file.name}`, "success");
  };

  const handlePlayToggle = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) {
      showSnackbar("Enter title and description", "warning");
      return;
    }
    createEpisode(title, description);
    setTitle("");
    setDescription("");
  };

  // --------------------- WebRTC ---------------------
  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;

      pcLocal.current = new RTCPeerConnection();
      pcRemote.current = new RTCPeerConnection();

      stream.getTracks().forEach((track) => pcLocal.current.addTrack(track, stream));

      pcLocal.current.onicecandidate = (e) => e.candidate && pcRemote.current.addIceCandidate(e.candidate);
      pcRemote.current.onicecandidate = (e) => e.candidate && pcLocal.current.addIceCandidate(e.candidate);

      pcRemote.current.ontrack = (e) => {
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
      };

      const offer = await pcLocal.current.createOffer();
      await pcLocal.current.setLocalDescription(offer);
      await pcRemote.current.setRemoteDescription(offer);

      const answer = await pcRemote.current.createAnswer();
      await pcRemote.current.setLocalDescription(answer);
      await pcLocal.current.setRemoteDescription(answer);

      setRecording(true);
      showSnackbar("🔴 Live broadcast started!", "info");
    } catch (err) {
      console.error(err);
      showSnackbar("Microphone access denied or unavailable.", "error");
    }
  };

  const stopLive = () => {
    setRecording(false);
    if (pcLocal.current) { pcLocal.current.close(); pcLocal.current = null; }
    if (pcRemote.current) { pcRemote.current.close(); pcRemote.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    showSnackbar("🟡 Live broadcast stopped.", "warning");
  };

  const handleToggleLive = () => { recording ? stopLive() : startLive(); };

  // -------------------- UI --------------------
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #00695c 0%, #283593 100%)", color: "#fff", position: "relative", py: 4 }}>
      {/* Live Button */}
      <Button
        variant="contained"
        onClick={handleToggleLive}
        sx={{
          position: "absolute", top: 16, right: 16,
          background: recording ? "linear-gradient(45deg, #FF416C, #FF4B2B)" : "linear-gradient(45deg, #00B4DB, #0083B0)",
          color: "#fff", fontWeight: 600,
          "&:hover": { boxShadow: 6, transform: "scale(1.05)" },
        }}
      >
        {recording ? "Stop Live" : "Go Live"}
      </Button>

      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Live Broadcast */}
            <Card sx={{ mb: 3, background: "rgba(255,255,255,0.05)", borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ color: "#FFD700", mb: 2 }}>Live Broadcast</Typography>
              <audio ref={remoteAudioRef} autoPlay controls style={{ width: "100%", borderRadius: 8 }} />
            </Card>

            {/* Audio Upload */}
            <Card sx={{ mb: 3, background: "rgba(255,255,255,0.05)", borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ color: "#FFD700", mb: 2 }}>Upload & Play Music</Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <label htmlFor="upload-audio-input">
                  <input hidden id="upload-audio-input" type="file" accept="audio/*" onChange={handleAudioUpload} />
                  <Button component="span" variant="contained" startIcon={<CloudUploadIcon />}
                    sx={{ background: "linear-gradient(45deg, #1FA2FF, #12D8FA, #A6FFCB)", color: "#000", fontWeight: 600 }}>Upload Music</Button>
                </label>
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handlePlayToggle} disabled={!audioSrc}
                  sx={{ background: "linear-gradient(45deg, #8E2DE2, #4A00E0)" }}>Play / Pause</Button>
              </Box>
              {audioSrc && <audio ref={audioRef} src={audioSrc} controls style={{ width: "100%", marginTop: 16, borderRadius: 8 }} />}
            </Card>

            {/* Add Episode Form */}
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, rgba(31,28,44,0.8), rgba(146,141,171,0.6))", borderRadius: 3 }}>
              <Typography variant="h6" sx={{ color: "#FFD700", mb: 2 }}>Add Episode</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)}
                    InputLabelProps={{ style: { color: "#fff" } }} sx={{ input: { color: "#fff" } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                    InputLabelProps={{ style: { color: "#fff" } }} sx={{ input: { color: "#fff" } }} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained"
                    sx={{ mt: 1, background: "linear-gradient(45deg, #FF512F, #DD2476)", "&:hover": { boxShadow: 6 } }}>Submit</Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Episodes List */}
            {submittedEpisodes.map((ep) => (
              <Card key={ep.id} sx={{ mb: 2, background: "rgba(255,255,255,0.05)", borderRadius: 3, p: 2, boxShadow: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#FFD700" }}>{ep.title}</Typography>
                <Typography variant="body2">{ep.description}</Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => updateEpisode(ep.id, ep.title + " ✏️", ep.description)}
                    sx={{ color: "#FFD700", borderColor: "#FFD700" }}>Edit</Button>
                  <Button size="small" variant="outlined" onClick={() => deleteEpisode(ep.id)}
                    sx={{ color: "#FF4B2B", borderColor: "#FF4B2B" }}>Delete</Button>
                </Box>
              </Card>
            ))}
          </Grid>
        </Grid>
      </Box>

      {/* Floating Chat */}
      <IconButton onClick={() => setShowChat((prev) => !prev)} sx={{
        position: "fixed", bottom: 24, right: 24,
        background: "linear-gradient(45deg, #8E2DE2, #4A00E0)", color: "#fff",
        "&:hover": { transform: "scale(1.1)", boxShadow: 6 },
      }}>
        <ChatIcon />
      </IconButton>

      {showChat && (
        <Paper sx={{
          position: "fixed", bottom: 90, right: 24, width: 320, height: 400,
          borderRadius: 3, display: "flex", flexDirection: "column",
          background: "linear-gradient(160deg, #0F2027, #203A43, #2C5364)"
        }}>
          <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="h6">Chat</Typography>
          </Box>
          <Box ref={chatListRef} sx={{ flex: 1, overflowY: "auto", p: 1 }}>
            <List>
              {messages.map((m) => (
                <React.Fragment key={m.id}>
                  <ListItem>
                    <ListItemText primary={m.text} secondary={m.from === "you" ? "You" : "System"} />
                  </ListItem>
                  <Divider sx={{ background: "rgba(255,255,255,0.1)" }} />
                </React.Fragment>
              ))}
            </List>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", p: 1, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <TextField
              variant="outlined" size="small" placeholder="Type..." value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
              sx={{ flex: 1, input: { color: "#fff" }, "& .MuiOutlinedInput-root fieldset": { borderColor: "rgba(255,255,255,0.3)" } }}
            />
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon sx={{ color: "#FFD700" }} />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
