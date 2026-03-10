function startBottle(){

players=[]
currentPlayer=0

showPlayersBottle()

}

function showPlayersBottle(){

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${t.playerName}</h2>

<input id="playerInput" placeholder="${t.playerName}">

<button onclick="addPlayerBottle()">${t.addPlayer}</button>

<div id="playersList"></div>

<button onclick="spinBottle()">${t.start}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}

function addPlayerBottle(){

const input=document.getElementById("playerInput")
const name=input.value.trim()

if(name==="") return

players.push(name)

input.value=""

updatePlayersBottle()

}

function updatePlayersBottle(){

const list=document.getElementById("playersList")

list.innerHTML=""

players.forEach(p=>{
list.innerHTML+=`<div class="player">${p}</div>`
})

}

function spinBottle(){

if(players.length===0) return

const randomPlayer = players[Math.floor(Math.random()*players.length)]

showBottleResult(randomPlayer)

}

function showBottleResult(player){

const t = translations[lang]

document.getElementById("app").innerHTML=`

<div class="questionCard">${player}</div>

<button onclick="spinBottle()">${t.next}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}
