let currentRoom = ""
let roomPlayers = []
let currentGame = ""

function openOnline(){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>🌐 ${t.online}</h2>

<button onclick="openOnlineGame('durak')">🃏 Дурак</button>

<button onclick="openOnlineGame('mafia')">🕵️ Мафия</button>

<button onclick="openOnlineGame('draw')">🎨 Рисуй и угадывай</button>

<button onclick="loadMain()">⬅ ${t.back}</button>

`

}

function openOnlineGame(game){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${game}</h2>

<button onclick="createRoom('${game}')">➕ ${t.createRoom}</button>

<button onclick="showJoinRoom('${game}')">🔑 ${t.joinRoom}</button>

<button onclick="openOnline()">⬅ ${t.back}</button>

`

}

function createRoom(game){

currentGame = game

currentRoom = Math.random().toString(36).substring(2,6).toUpperCase()

roomPlayers = ["Вы"]

openRoom()

}

function showJoinRoom(game){

document.getElementById("app").innerHTML = `

<h2>${game}</h2>

<input id="roomCode" placeholder="ABCD">

<button onclick="joinRoom('${game}')">Войти</button>

<button onclick="openOnline()">⬅ Назад</button>

`

}

function joinRoom(game){

currentGame = game

currentRoom = document.getElementById("roomCode").value.toUpperCase()

roomPlayers = ["Вы"]

openRoom()

}

function openRoom(){

let playersHTML = ""

roomPlayers.forEach((p,i)=>{
playersHTML += <p>${i+1}. ${p}</p>
})

document.getElementById("app").innerHTML = `

<h2>Комната ${currentRoom}</h2>

<h3>Игроки</h3>

${playersHTML}

<button onclick="addFakePlayer()">➕ Добавить игрока (тест)</button>

<button onclick="startOnlineGame()">🎮 Начать игру</button>

<button onclick="openOnline()">⬅ Назад</button>

`

}

function addFakePlayer(){

const name = "Игрок " + (roomPlayers.length+1)

roomPlayers.push(name)

openRoom()

}

function startOnlineGame(){

alert("Запуск игры: " + currentGame)

}
