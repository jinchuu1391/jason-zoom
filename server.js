// const express = require("express");
import express from 'express'
const app = express();
import http from 'http'
const server = http.Server(app);
// const server = require("http").Server(app);
// const { v4: uuidv4 } = require("uuid");
import {v4} from 'uuid'
// const io = require("socket.io")(server);
import socketIO from 'socket.io'
const io = socketIO(server);
import {ExpressPeerServer} from 'peer'
// const { ExpressPeerServer } = require("peer");
import url from 'url'
// const url = require("url");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
// const path = require("path");
import path from 'path'

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.get("/join", (req, res) => {
    res.redirect(
        url.format({
            pathname: `/join/${uuidv4()}`,
            query: req.query,
        })
    );
});

app.get("/joinold", (req, res) => {
    res.redirect(
        url.format({
            pathname: req.query.meeting_id,
            query: req.query,
        })
    );
});

app.get("/join/:rooms", (req, res) => {
    res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id, myname) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", id, myname);

        socket.on("messagesend", (message) => {
            console.log(message);
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            console.log(myname);
            socket.to(roomId).broadcast.emit("AddName", myname);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).broadcast.emit("user-disconnected", id);
        });
    });
});

server.listen(process.env.PORT || 3030);