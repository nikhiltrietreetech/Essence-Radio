import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Card,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Fade,
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
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to Essence Radio chat!", from: "system" },
  ]);
  const [showChat, setShowChat] = useState(false);
  const chatListRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const audioRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);

  // WebRTC states
  const [recording, setRecording] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcLocal = useRef(null);
  const pcRemote = useRef(null);
  const streamRef = useRef(null);

  const API_BASE = "http://localhost:5000"; // Backend URL

  const showSnackbar = (message, severity = "info") =>
    setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => stopLive();
  }, []);

  // ------------------ CRUD ------------------
  const createEpisode = async (title, description) => {
    try {
      const { data } = await axios.post(`${API_BASE}/api/episodes`, {
        title,
        description,
      });
      setSubmittedEpisodes((prev) => [...prev, data]);
      showSnackbar("Episode created successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to create episode.", "error");
    }
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages((m) => [
      ...m,
      { id: Date.now(), text: chatInput, from: "you" },
    ]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      showSnackbar("Enter title and description", "warning");
      return;
    }

    try {
      await createEpisode(title, description);
      setTitle("");
      setDescription("");
      setShowEpisodeForm(false);
      startLive();
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to start live broadcast.", "error");
    }
  };

  // ------------------ WebRTC ------------------
  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;

      pcLocal.current = new RTCPeerConnection();
      pcRemote.current = new RTCPeerConnection();

      stream.getTracks().forEach((track) =>
        pcLocal.current.addTrack(track, stream)
      );

      pcLocal.current.onicecandidate = (e) =>
        e.candidate && pcRemote.current.addIceCandidate(e.candidate);
      pcRemote.current.onicecandidate = (e) =>
        e.candidate && pcLocal.current.addIceCandidate(e.candidate);

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
      setShowEpisodeForm(false);
      showSnackbar("🔴 Live broadcast started!", "info");
    } catch (err) {
      console.error(err);
      showSnackbar("Microphone access denied or unavailable.", "error");
    }
  };

  const stopLive = () => {
    setRecording(false);
    setShowEpisodeForm(false);
    if (pcLocal.current) {
      pcLocal.current.close();
      pcLocal.current = null;
    }
    if (pcRemote.current) {
      pcRemote.current.close();
      pcRemote.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    showSnackbar("🟡 Live broadcast stopped.", "warning");
  };

  const handleToggleLive = () => {
    if (recording) stopLive();
    else setShowEpisodeForm(true);
  };

  // ------------------ UI ------------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00695c 0%, #283593 100%)",
        color: "#fff",
        position: "relative",
        py: 4,
      }}
    >
      {/* Live Button */}
    <Box sx={{ mb: 3, textAlign: "right" ,mr:3}}>
  <Button
    variant="contained"
    onClick={handleToggleLive}
    sx={{
      background: recording
        ? "linear-gradient(45deg, #FF416C, #FF4B2B)"
        : "linear-gradient(45deg, #00B4DB, #0083B0)",
      color: "#fff",
      fontWeight: 600,
      "&:hover": { boxShadow: 6, transform: "scale(1.05)" },
    }}
  >
    {recording ? "Stop Live" : "Go Live"}
  </Button>
</Box>


      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Grid container spacing={3}>
          {/* Left Column: Broadcast + Upload */}
          <Grid item xs={12} md={8} justifyContent="center">
            <Card
              sx={{
                mb: 3,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 3,
                p: 3,
                 width: { xs: "85%", sm: "90%", md: 800 }
              }}
            >
              {submittedEpisodes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: "#FFD700" }}>
                    🎙 Current Episode
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "white", mb: 1 }}>
                    {submittedEpisodes[submittedEpisodes.length - 1].title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "white", fontStyle: "italic" }}>
                    {submittedEpisodes[submittedEpisodes.length - 1].description}
                  </Typography>
                </Box>
              )}

              <Typography variant="h6" sx={{ color: "#FFD700", mb: 2 }}>
                Live Broadcast
              </Typography>
              <audio
                ref={remoteAudioRef}
                autoPlay
                controls
                style={{ width: "100%", borderRadius: 8 }}
              />
            </Card>

            {/* Upload & Play Music */}
            <Card
              sx={{
                mb: 3,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 3,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: "#FFD700", mb: 2 }}>
                Upload & Play Music
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <label htmlFor="upload-audio-input">
                  <input hidden id="upload-audio-input" type="file" accept="audio/*" onChange={handleAudioUpload} />
                  <Button
                    component="span"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      background: "linear-gradient(45deg, #1FA2FF, #12D8FA, #A6FFCB)",
                      color: "#000",
                      fontWeight: 600,
                    }}
                  >
                    Upload Music
                  </Button>
                </label>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handlePlayToggle}
                  disabled={!audioSrc}
                  sx={{ background: "linear-gradient(45deg, #8E2DE2, #4A00E0)" }}
                >
                  Play / Pause
                </Button>
              </Box>
              {audioSrc && (
                <audio ref={audioRef} src={audioSrc} controls style={{ width: "100%", marginTop: 16, borderRadius: 8 }} />
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Popover Add Episode Form */}
         <Fade in={showEpisodeForm}>
  <Paper
    component="form"
    onSubmit={handleSubmit}
    sx={{
      position: "fixed",
      top: { xs: "50%", sm: "50%", md: "20%" }, // slightly higher on large screens
      left: { xs: "50%", sm: "50%", md: "auto" }, // auto for large screens
      right: { xs: "auto", sm: "auto", md: 70 }, // right side for large screens
      transform: { xs: "translate(-50%, -50%)", sm: "translate(-50%, -50%)", md: "none" }, // center small screens
      zIndex: 2000,
      width: { xs: "80%", sm: 400, md: 400 },
      maxWidth: "90%",
      p: { xs: 2, sm: 3 },
      background: "linear-gradient(135deg, rgba(31,28,44,0.95), rgba(31,28,44,0.95))",
      borderRadius: 3,
      boxShadow: 8,
    }}
  >
    <Typography
      variant="h6"
      sx={{ color: "#FFD700", mb: 2, textAlign: "center", fontSize: { xs: 18, sm: 20 } }}
    >
      Add Live Episode
    </Typography>
    
    <TextField
      fullWidth
      label="Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      InputLabelProps={{ style: { color: "#fff" } }}
      sx={{ input: { color: "#fff" }, mb: 2 }}
    />
    
    <TextField
      fullWidth
      label="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      InputLabelProps={{ style: { color: "#fff" } }}
      multiline
      rows={4}
      sx={{ input: { color: "#fff" }, mb: 2 }}
    />
    
    <Button
      type="submit"
      fullWidth
      variant="contained"
      sx={{
        background: "linear-gradient(45deg, #FF512F, #DD2476)",
        "&:hover": { boxShadow: 6 },
        py: 1.5,
      }}
    >
      Submit Episode
    </Button>
  </Paper>
</Fade>



      {/* Floating Chat */}
      <IconButton
        onClick={() => setShowChat((prev) => !prev)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(45deg, #8E2DE2, #4A00E0)",
          color: "#fff",
          "&:hover": { transform: "scale(1.1)", boxShadow: 6 },
        }}
      >
        <ChatIcon />
      </IconButton>

      {showChat && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: { xs: 280, sm: 320 },
            height: { xs: 300, sm: 400 },
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(160deg, #0F2027, #203A43, #2C5364)",
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="h6">Chat</Typography>
          </Box>
          <Box ref={chatListRef} sx={{ flex: 1, overflowY: "auto", p: 1 }}>
            <List>
              {messages.map((m) => (
                <React.Fragment key={m.id}>
                  <ListItem>
                    <ListItemText
                      primary={m.text}
                      secondary={m.from === "you" ? "You" : "System"}
                    />
                  </ListItem>
                  <Divider sx={{ background: "rgba(255,255,255,0.1)" }} />
                </React.Fragment>
              ))}
            </List>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="Type..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              sx={{
                flex: 1,
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            />
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon sx={{ color: "#FFD700" }} />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
