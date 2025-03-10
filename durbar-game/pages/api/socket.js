import { userAgent } from "next/server";
import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // Create an object to store all lobbies
  const lobbies = {};

  //   io.on("connection", (socket) => {
  //     socket.on("send-message", (obj) => {
  //       io.emit("receive-message", obj);
  //     });
  //   });

  io.on("connection", (socket) => {
    // Create a new lobby when the user clicks the "Create Lobby" button
    socket.on("createLobby", (username, currentImage) => {
      const lobbyId = Math.floor(Math.random() * 100000);
      console.log(username, currentImage);
      console.log(lobbyId);
      lobbies[lobbyId] = {
        players: [{ username: username, image: currentImage }],
      };
      console.log("lobby created 1");
      console.log(lobbies);

      // Send the lobby ID to the user
      socket.emit("lobbyCreated", lobbyId);
    });

    // Join a lobby when the user clicks the "Join Lobby" button
    socket.on("enterLobby", (username, image, lobbyId) => {
      // Check if the lobby exists

      if (!lobbies[lobbyId]) {
        console.log(lobbies);
        socket.emit("lobbyDoesNotExist");
        return;
      }
      console.log("00000000000000000000000000000000");
      console.log(username, image);
      console.log("00000000000000000000000000000000");
      console.log(lobbies);

      console.log("lobby joined");

      // Add the user to the lobby
      lobbies[lobbyId].players.push({ username: username, image: image });

      console.log("enter lobby" + lobbies);
      const allPlayers = lobbies;
      // Send the lobby state to the user
      //   socket.emit("lobbyState", lobbies[lobbyId]);
      socket.emit("lobbyState", lobbies, lobbyId);
    });

    // When you first click on the enter lobby button. Before character choose
    socket.on("joinLobby", (lobbyId) => {
      // Check if the lobby exists

      if (!lobbies[lobbyId]) {
        console.log(lobbies);
        socket.emit("lobbyDoesNotExist");
      } else {
        socket.emit("lobbyExists", lobbyId);
      }
    });

    // Join a lobby when the user clicks the "Join Lobby" button
    socket.on("getLobby", (lobbyId) => {
      const lobby = lobbies[lobbyId];

      console.log("get lobby" + lobby.players);

      if (!lobby) {
        return [];
      } else {
        const allPlayers = lobby.players;
        socket.emit("allLobbies", allPlayers);
      }
    });

    // Start the game when the lobby is full
    socket.on("startGame", () => {
      const lobby = lobbies[socket.lobbyId];
      console.log("starttt");
      // Start the game for all players in the lobby
      for (const player of lobby.players) {
        player.emit("startGame");
      }
    });

    socket.on("leaveLobby", (username, lobbyCode) => {
      const lobby = lobbies.get(lobbyCode);
      if (!lobby) {
        return;
      }

      lobby.players.splice(lobby.players.indexOf(username), 1);
    });

    // socket.on("disconnect", () => {
    //   for (const lobby of lobbies.values()) {
    //     lobby.players.splice(lobby.players.indexOf(socket), 1);
    //   }
    // });
  });

  console.log("Setting up socket");
  res.end();
}
