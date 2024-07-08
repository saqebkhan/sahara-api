const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

let rooms = {};

// Middleware
app.use(cors());

// Event listeners for socket connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("createRoom", (room) => {
    if (!rooms[room]) {
      rooms[room] = { users: {}, votes: {}, showVotes: false };
      socket.join(room);
      socket.emit("roomCreated", room);
    } else {
      socket.emit("error", "Room already exists");
    }
  });

  socket.on("joinRoom", (room) => {
    if (rooms[room]) {
      socket.join(room);
      socket.emit("roomJoined", room);
      io.to(room).emit("updateUsers", rooms[room].users);
    } else {
      socket.emit("error", "Room does not exist");
    }
  });

  socket.on("setName", ({ room, name }) => {
    if (rooms[room]) {
      rooms[room].users[socket.id] = name;
      io.to(room).emit("updateUsers", rooms[room].users);
    } else {
      socket.emit("error", "Room does not exist");
    }
  });

  socket.on("vote", ({ room, vote }) => {
    if (rooms[room]) {
      rooms[room].votes[socket.id] = vote;
      io.to(room).emit("updateVotes", Object.keys(rooms[room].votes).length);
    } else {
      socket.emit("error", "Room does not exist");
    }
  });

  socket.on("revealVotes", (room) => {
    if (rooms[room]) {
      rooms[room].showVotes = true;
      const votes = rooms[room].votes;
      const voteValues = Object.values(votes);
      const average = voteValues.reduce((a, b) => a + b, 0) / voteValues.length;
      io.to(room).emit("revealVotes", { votes, average });
    } else {
      socket.emit("error", "Room does not exist");
    }
  });

  socket.on("clearVotes", (room) => {
    if (rooms[room]) {
      rooms[room].votes = {};
      rooms[room].showVotes = false;
      io.to(room).emit("updateVotes", 0);
    } else {
      socket.emit("error", "Room does not exist");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (let room in rooms) {
      if (rooms[room].users[socket.id]) {
        delete rooms[room].users[socket.id];
        delete rooms[room].votes[socket.id];
        io.to(room).emit("updateUsers", rooms[room].users);
        io.to(room).emit("updateVotes", Object.keys(rooms[room].votes).length);
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
