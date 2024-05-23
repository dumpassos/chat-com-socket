const express = require('express');
const path = require("path");
const http = require("http");
const socketIO = require('socket.io'); //importando o socket.io

const app = express();
const server = http.createServer(app);
const io = socketIO(server); //criando a variável do socket.io

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000);

let connectedUsers = []; //lista de usuarios conectados

io.on('connection', (socket)=>{ //criando listener de conexão
    console.log("Conexão detectada...")

    socket.on('join-request', (username)=>{ //requisição de entrada (listener)
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);

        socket.emit('user-ok', connectedUsers); //resposta do servidor para o cliente
        socket.broadcast.emit('list-update', { //resposta do servidor para todas as outras conexões
            joined: username,
            list: connectedUsers
        });
    });

    socket.on('disconnect', ()=>{
        connectedUsers = connectedUsers.filter(u => u != socket.username);
        console.log(connectedUsers);

        socket.broadcast.emit('list-update', { 
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-msg', (txt)=>{
        let obj = {
            username: socket.username,
            message: txt
        };

        //socket.emit('show-msg', obj);
        socket.broadcast.emit('show-msg', obj);
    });

});