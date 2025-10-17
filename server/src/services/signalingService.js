export const setupSignaling = (io) => {
    io.on("connection", (socket) => {
      console.log("🎧 User connected:", socket.id);
  
      socket.on("offer", (data) => {
        socket.broadcast.emit("offer", data);
      });
  
      socket.on("answer", (data) => {
        socket.broadcast.emit("answer", data);
      });
  
      socket.on("ice-candidate", (data) => {
        socket.broadcast.emit("ice-candidate", data);
      });
  
      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });
  };
  