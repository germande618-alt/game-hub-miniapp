let isHost = false
const socket = new WebSocket("wss://game-hub-miniapp-production.up.railway.app")

let roomID = null
let currentGame = null
let playerName = ""

socket.onopen = () => {
    console.log("Connected to server")
}

socket.onmessage = (event) => {

    const data = JSON.parse(event.data)
    console.log("Server message:", data)

if(data.type === "room_created"){

    roomID = data.code
    isHost = true

    askPlayerName(currentGame, roomID)

}

    if(data.type === "joined"){
        roomID = data.code
        openRoom(roomID, currentGame)
    }

}

function openOnline(){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>🌐 ${t.online}</h2>

<button onclick="openOnlineGame('durak')">🃏 ${t.durak}</button>

<button onclick="openOnlineGame('mafia')">🕵️ ${t.mafia}</button>

<button onclick="openOnlineGame('draw')">🎨 ${t.draw}</button>

<button onclick="loadMain()">⬅️ ${t.back}</button>

`

}

function openOnlineGame(game){

currentGame = game
const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${game}</h2>

<button onclick="createRoom('${game}')">➕ ${t.createRoom}</button>

<button onclick="showJoinRoom('${game}')">🔑 ${t.joinRoom}</button>

<button onclick="openOnline()">⬅️ ${t.back}</button>

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

function askPlayerName(game, code){

document.getElementById("app").innerHTML = `

<h2>Введите имя</h2>

<input id="playerNameInput" placeholder="Ваше имя">

<button onclick="enterRoom('${game}')">Продолжить</button>

`

}

function showJoinRoom(game){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${t[game]}</h2>

<input id="roomCode" placeholder="${t.roomCode}">

<button onclick="joinRoom('${game}')">🔑 ${t.join}</button>

<button onclick="openOnline()">⬅️ ${t.back}</button>

`

}

function joinRoom(game){

currentGame = game

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

<button onclick="openOnline()">⬅️ Назад</button>

`

}

function startOnlineGame(game){

alert("Запуск игры: " + game)

}

function enterRoom(game){

const t = translations[lang]

playerName = document.getElementById("playerNameInput").value

if(!playerName){
playerName = t.player
}

socket.send(JSON.stringify({
    type: "set_name",
    name: playerName
}))

openRoom(roomID, game)

}
