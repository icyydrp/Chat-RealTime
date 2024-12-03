const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Lista de usuarios conectados
const users = {};
let userCount = 0;

// WebSocket con Socket.IO
io.on("connection", (socket) => {
    console.log("Un usuario se ha conectado:", socket.id);

    // Asignar un nombre de usuario al conectarse
    userCount++;
    const username = `Usuario ${userCount}`;
    users[socket.id] = username;

    // Notificar al cliente su nombre de usuario
    socket.emit("assign username", username);

    // Informar a todos los usuarios que uno se conectó
    io.emit("user connected", username);

    // Manejar mensajes enviados desde el cliente
    socket.on("chat message", (data) => {
        io.emit("chat message", data); // Enviar mensaje a todos
    });

    // Informar cuando un usuario se desconecta
    socket.on("disconnect", () => {
        const username = users[socket.id];
        delete users[socket.id];
        console.log(`Usuario desconectado: ${username}`);
        io.emit("user disconnected", username);
    });
});

// Puerto de escucha
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
