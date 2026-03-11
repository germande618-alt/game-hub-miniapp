let players = []

function startBottle(){

players = []
showBottlePlayers()

}

function showBottlePlayers(){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${t.playerName}</h2>

<input id="playerInput" placeholder="${t.playerName}">

<button onclick="addBottlePlayer()">${t.addPlayer}</button>

<div id="playersList"></div>

<button onclick="showBottleGame()">${t.start}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}

function addBottlePlayer(){

const input = document.getElementById("playerInput")
const name = input.value.trim()

if(name === "") return

players.push(name)

input.value=""

updateBottlePlayers()

}

function updateBottlePlayers(){

const list = document.getElementById("playersList")

list.innerHTML=""

players.forEach(p=>{
list.innerHTML += `<div class="player">${p}</div>`
})

}

function showBottleGame(){

document.getElementById("app").innerHTML = `

<div class="bottleSimple">

<div id="bottle">🍾</div>

<div id="bottleResult"></div>

<button onclick="spinBottle()">Крутить</button>

</div>

`

}

function spinBottle(){

const bottle = document.getElementById("bottle")
const result = document.getElementById("bottleResult")

const player = players[Math.floor(Math.random()*players.length)]

const rotation = 720 + Math.random()*360

bottle.style.transform = `rotate(${rotation}deg)`

setTimeout(()=>{
result.innerText = "👉 " + player
},1500)

}
