const express = require("express");
const { ExpressPeerServer } = require("peer");
const app = express();
const server = require("http").createServer(app);
const peerserver = require("http").createServer(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");

const PeerServer = ExpressPeerServer(peerserver, {
  debug: true,
});
app.set("view engine", "ejs");
app.use(express.static("pub"));
app.use("/peerjs", PeerServer);
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
app.get("/:rooms", (req, res) => {
  res.render("room", { roomId: req.params.rooms });
});
io.on("connection", (socket) => {
  socket.on("joined-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("joined", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createmessage", message);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user_disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3000);
peerserver.listen(9000);
