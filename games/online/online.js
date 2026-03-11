function openOnline(){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h1>🌐 ${t.online}</h1>

<button onclick="createRoom()">${t.createRoom}</button>

<button onclick="joinRoom()">${t.joinRoom}</button>

<button onclick="loadMain()">⬅ ${t.back}</button>

`

}

function createRoom(){

const code = Math.floor(1000 + Math.random()*9000)

document.getElementById("app").innerHTML = `

<h2>Комната создана</h2>

<div class="roomCode">${code}</div>

<p>Поделитесь кодом с друзьями</p>

<button onclick="openOnline()">⬅ Назад</button>

`

}

function joinRoom(){

document.getElementById("app").innerHTML = `

<h2>Введите код комнаты</h2>

<input id="roomInput" placeholder="1234">

<button onclick="connectRoom()">Подключиться</button>

<button onclick="openOnline()">⬅ Назад</button>

`

}

function connectRoom(){

const code = document.getElementById("roomInput").value

alert("Подключение к комнате " + code)

}
