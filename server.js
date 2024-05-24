import express from 'express'
import http from 'http'
import {v4} from 'uuid'
import socketIO from 'socket.io'
import {ExpressPeerServer} from 'peer'
import url from 'url'
import path from 'path'
import joinRoutes from './routes/join'

const app = express();

const server = http.Server(app);

const io = socketIO(server);

// WebRTC 연결을 위한 중개 서버
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.use(joinRoutes)

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id, myname) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", id, myname);

        socket.on("messagesend", (message) => {
            console.log(message);
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            console.log(myname);
            socket.to(roomId).emit("AddName", myname);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", id);
        });
    });
});

server.listen(process.env.PORT || 3030);