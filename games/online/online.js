let playerName = ""

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

const code = Math.random().toString(36).substring(2,6).toUpperCase()

askPlayerName(game, code)

<h2>Комната ${code}</h2>

<p>Игра: ${game}</p>

<h3>Игроки</h3>

<p>1. Вы</p>

<button onclick="startOnlineGame('${game}')">🎮 Начать игру</button>

<button onclick="openOnline()">⬅ Назад</button>

`

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

const code = document.getElementById("roomCode").value

alert("Игра: " + game + " | Комната: " + code)

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

playerName = document.getElementById("playerNameInput").value

if(!playerName){
playerName = "Игрок"
}

document.getElementById("app").innerHTML = `

<h2>Комната ${code}</h2>

<p>Игра: ${game}</p>

<h3>Игроки</h3>

<p>1. ${playerName}</p>

<button onclick="startOnlineGame('${game}')">🎮 Начать игру</button>

<button onclick="openOnline()">⬅ Назад</button>

`

}
