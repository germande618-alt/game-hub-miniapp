console.log("ONLINE JS LOADED")
console.log("SCRIPT LOADED")
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
    askPlayerName(currentGame, roomID)
}

if(data.type === "players"){

    let playersHTML = ""

    data.players.forEach((name, i)=>{
        playersHTML += "<p>" + (i+1) + ". " + name + "</p>"
    })

    let startButton = ""

    if(isHost){
        startButton = '<button onclick="startOnlineGame(\'' + currentGame + '\')">🎮 Начать игру</button>'
    }

    document.getElementById("app").innerHTML =

    "<h2>Комната " + roomID + "</h2>" +

    "<p>Игра: " + currentGame + "</p>" +

    "<h3>Игроки:</h3>" +

    playersHTML +

    startButton +

    '<button onclick="openOnline()">⬅️ Назад</button>'
}

}

function openOnline(){
    console.log("openOnline CLICKED")

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

    currentGame = game

    socket.send(JSON.stringify({
        type: "create"
    }))

    document.getElementById("app").innerHTML = 
    "<h2>" + t.enterName + "</h2>" +

    "<input id='playerNameInput' placeholder='" + t.yourName + "'>" +

    "<button onclick='enterRoom()'>➡️ " + t.continue + "</button>" +

    "<button onclick='openOnline()'>⬅️ " + t.back + "</button>"

}

function askPlayerName(game, code){

    const t = translations[lang]

    document.getElementById("app").innerHTML = 
    "<h2>" + t.enterName + "</h2>" +

    "<input id='playerNameInput' placeholder='" + t.yourName + "'>" +

    "<button onclick='enterRoom()'>➡️ " + t.continue + "</button>"

}

function showJoinRoom(game){

    currentGame = game

    document.getElementById("app").innerHTML =
    "<h2>Вход в комнату</h2>" +

    "<input id='roomCode' placeholder='Код комнаты'>" +

    "<button id='joinBtn'>Войти</button>" +

    "<button onclick='openOnline()'>Назад</button>"

    setTimeout(()=>{
        document.getElementById("joinBtn").onclick = joinRoom
    }, 0)
}

function joinRoom(){

    console.log("JOIN CLICKED")

    const input = document.getElementById("roomCode")

    if(!input){
        alert("Ошибка: нет поля ввода")
        return
    }

    const code = input.value.trim().toUpperCase()

    if(!code){
        alert("Введите код")
        return
    }

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

function enterRoom(){

    const t = translations[lang]

    playerName = document.getElementById("playerNameInput").value

    if(!playerName){
        playerName = t.player
    }

    socket.send(JSON.stringify({
        type:"set_name",
        name:playerName
    }))

    document.getElementById("app").innerHTML =
    "<h2>" + t.room + " " + roomID + "</h2>" +
    "<p>⏳ Ожидание игроков...</p>"
}
