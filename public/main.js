const socket = io(); //iniciando a conexão com o socket.io (cliente)

let username = ''; //armazenar o usuário
let userList = []; //armazenar a lista dos usuários


    //pegando os campos do HTML aonde serão necessárias ações

let loginPage = document.querySelector("#loginPage");
let chatPage = document.querySelector("#chatPage");
let loginNameInput = document.querySelector("#loginNameInput");
let chatTextInput = document.querySelector("#chatTextInput");

loginPage.style.display = 'flex'; //exibindo página de login
chatPage.style.display = 'none'; //escondendo a página do chat

function renderUserList() {
    let ul = document.querySelector('.userList'); //pegando o ul html
    ul.innerHTML = ''; //limpando qualquer coisa que tiver na lista

    userList.forEach(i =>{ // 'i' de item, que no caso é cada item do array 
        ul.innerHTML += `<li>${i}</li>`;
    });

};

function addMessage(type, user, msg){
    let ul = document.querySelector('.chatList');

    switch(type){
        case 'status':
                ul.innerHTML += `<li class="m-status">${msg}</li>`;
        break;

        case 'msg': 
            if(username == user){ //add agora
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}: </span> ${msg}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}: </span> ${msg}</li>`;
            }
        break;
    }

    ul.scrollTop = ul.scrollHeight; //barra de rolagem desce automaticamente com as mensagens
};

loginNameInput.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){ //se o usuário apertar "enter"
        let name = loginNameInput.value.trim(); //pegue o que ele digitou e tire os espaços do início/final

        if(name != ''){ //se o que ele digitou for diferente de vazio
            username = name; //armazene o que ele digitou na variável 'username' como string.
            document.title = `Chat (${username})`; //e mude o título do documento
        }

        socket.emit('join-request', username); //
    }
});

chatTextInput.addEventListener('keyup', (e)=>{ 
    if(e.keyCode === 13){ //se o usuário apertar "enter"
        let txt = chatTextInput.value.trim(); //tirar os espaços do início/final
        chatTextInput.value = ''; //limpar imput após o enter

        if(txt != ''){ //se o que ele digitou for diferente de vazio
            addMessage('msg', username, txt);
            socket.emit('send-msg', txt); //envie a mensagem para o servidor
        }
    }
});

socket.on('user-ok', (list)=>{ //após receber o OK do servidor
    loginPage.style.display = 'none'; //escondendo página de login
    chatPage.style.display = 'flex'; //exibindo a página do chat
    chatTextInput.focus(); //foca no campo de texto/mensagem

    addMessage('status', null, 'Conectado!'); // os 3 parâmetros

    userList = list; //preenchendo a lista de usuarios com os usuarios conectados
    renderUserList(); //rodando a função para exibir a lista de usuarios na tela
});

socket.on('list-update', (data)=>{

        if(data.joined){
            addMessage('status', null, `${data.joined} entrou no chat`);
        }
        
        if(data.left){
            addMessage('status', null, `${data.left} saiu do chat`);
        }

        userList = data.list;
        renderUserList();
});

socket.on('show-msg', (data)=>{
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', ()=>{
    addMessage('status', null, 'Você foi desconectado...');
    userList = []; //limpa a lista de usuários
    renderUserList();
});

socket.on('connect_error', ()=>{
    addMessage('status', null, 'Tentando reconexão com o servidor...');
});

socket.io.on('reconnect', ()=>{
    addMessage('status', null, 'Reconectado. Que bom ter você de volta!');

    if(username != ''){
        socket.emit('join-request', username)
    }
});



