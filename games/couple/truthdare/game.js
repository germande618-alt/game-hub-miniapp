let mode = "date"

function openTruthDare(){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>💘 ${t.truth}</h2>

<button onclick="selectMode('date')">💫 Первое свидание</button>

<button onclick="selectMode('couple')">❤️ Давно вместе</button>

<button onclick="selectMode('adult')">🔞 18+</button>

<button onclick="openCouple()">⬅ ${t.back}</button>

`

}

function selectMode(selected){

mode = selected

showPlayers()

}

function showPlayers(){

if(!mode){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>💘 ${t.truth}</h2>

<button onclick="selectMode('date')">💫 Первое свидание</button>

<button onclick="selectMode('couple')">❤️ Давно вместе</button>

<button onclick="selectMode('adult')">🔞 18+</button>

<button onclick="openCouple()">⬅ ${t.back}</button>

`

return

}

players=[]
currentPlayer=0

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${t.playerName}</h2>

<input id="playerInput" placeholder="${t.playerName}">

<button onclick="addPlayer()">${t.addPlayer}</button>

<div id="playersList"></div>

<button onclick="startGame()">${t.start}</button>

<button onclick="loadMain()">⬅ ${t.back}</button>

`

}

function addPlayer(){

const input = document.getElementById("playerInput")
const name = input.value.trim()

if(name==="") return

players.push(name)

input.value=""

updatePlayers()

}

function updatePlayers(){

const list = document.getElementById("playersList")

list.innerHTML=""

players.forEach(p=>{
list.innerHTML+=`<div class="player">${p}</div>`
})

}

function startGame(){

if(players.length===0) return

currentPlayer=0

showTurn()

}

function showTurn(){

const t = translations[lang]

const player = players[currentPlayer]

document.getElementById("app").innerHTML=`

<h2>${player}</h2>

<button onclick="showTruth()">${t.truth}</button>

<button onclick="showDare()">${t.dare}</button>

<button onclick="loadMain()">⬅ ${t.back}</button>

`

}

function nextPlayer(){

currentPlayer++

if(currentPlayer>=players.length){
currentPlayer=0
}

showTurn()

}

function showTruth(){

let list

if(mode === "date"){
list = dateTruth
}

if(mode === "couple"){
list = coupleTruth
}

if(mode === "adult"){
list = adultTruth
}

const challenge = list[Math.floor(Math.random()*list.length)]

showChallenge(challenge)

}

function showDare(){

let list

if(mode === "date"){
list = dateDare
}

if(mode === "couple"){
list = coupleDare
}

if(mode === "adult"){
list = adultDare
}

const challenge = list[Math.floor(Math.random()*list.length)]

showChallenge(challenge)

}

function showChallenge(text){

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${text}</h2>

<button onclick="nextPlayer()">${t.next}</button>

<button onclick="showTurn()">⬅ ${t.back}</button>

`

}
