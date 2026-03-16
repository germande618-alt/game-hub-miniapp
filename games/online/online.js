const socket = new WebSocket("wss://game-hub-miniapp-production.up.railway.app")

socket.onmessage = (event) => {

    const data = JSON.parse(event.data)

    // сервер создал комнату
    if(data.type === "room_created"){

        roomID = data.code

        document.getElementById("app").innerHTML = `
        <h2>Комната ${roomID}</h2>
        <p>Отправьте этот код друзьям</p>
        `

    }

    // игрок вошел
    if(data.type === "joined"){

        roomID = data.code

        document.getElementById("app").innerHTML = `
        <h2>Комната ${roomID}</h2>
        <p>Вы в комнате</p>
        `

    }

}

socket.onopen = () => {
    console.log("Connected to server")
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log("Server message:", data)
}
let roomID = null
let currentGame = null
let playerName = ""

function openOnline(){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>🌐 ${t.online}</h2>

<button onclick="openOnlineGame('durak')">🃏 ${t.durak}</button>

<button onclick="openOnlineGame('mafia')">🕵️ ${t.mafia}</button>

<button onclick="openOnlineGame('draw')">🎨 ${t.draw}</button>

<button onclick="loadMain()">⬅ ${t.back}</button>

`

}

function openOnlineGame(game){
currentGame = game

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${game}</h2>

<button onclick="createRoom('${game}')">➕ ${t.createRoom}</button>

<button onclick="showJoinRoom('${game}')">🔑 ${t.joinRoom}</button>

<button onclick="openOnline()">⬅ ${t.back}</button>

`

}

function createRoom(game){

const t = translations[lang]

socket.send(JSON.stringify({
    type: "create"
}))

document.getElementById("app").innerHTML = `

<h2>${t.enterName}</h2>

<input id="playerNameInput" placeholder="${t.yourName}">

<button onclick="enterRoom('${game}')">➡️ ${t.continue}</button>

<button onclick="openOnline()">⬅️ ${t.back}</button>

`

}

function showJoinRoom(game){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${t[game]}</h2>

<input id="roomCode" placeholder="${t.roomCode}">

<button onclick="joinRoom('${game}')">🔑 ${t.join}</button>

<button onclick="openOnline()">⬅ ${t.back}</button>

`

}

function joinRoom(game){

const code = document.getElementById("roomCode").value.toUpperCase()

socket.send(JSON.stringify({
    type:"join",
    code:code
}))

}

function openRoom(code, game){

document.getElementById("app").innerHTML = `

<h2>Комната ${code}</h2>

<p>Игра: ${game}</p>

<p>Игроки:</p>

<p>1. Вы</p>

<button onclick="startOnlineGame('${game}')">🎮 Начать игру</button>

<button onclick="openOnline()">⬅ Назад</button>

`

}

function startOnlineGame(game){

alert("Запуск игры: " + game)

}

function askPlayerName(game, code){

document.getElementById("app").innerHTML = `

<h2>Введите имя</h2>

<input id="playerNameInput" placeholder="Ваше имя">

<button onclick="enterRoom('${game}','${code}')">Продолжить</button>

`

}

function enterRoom(game, code){

const t = translations[lang]

let playerName = document.getElementById("playerNameInput").value

if(!playerName){
playerName = t.player
}

document.getElementById("app").innerHTML = `

<h2>${t.room} ${code}</h2>

<p>${t.game}: ${game}</p>

<h3>${t.players}</h3>

<p>1. ${playerName}</p>

<button onclick="startOnlineGame('${game}')">🎮 ${t.startGame}</button>

<button onclick="openOnline()">⬅ ${t.back}</button>

`

}
