let mode = "date"

function showPlayers(){

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

const list = cards.truth[lang] || cards.truth.en

const challenge = list[Math.floor(Math.random()*list.length)]

showChallenge(challenge)

}

function showDare(){

const list = cards.dare[lang] || cards.dare.en

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
