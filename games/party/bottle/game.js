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

<button onclick="startBottleGame()">${t.start}</button>

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

function startBottleGame(){

if(players.length===0) return

spinBottle()

}

function spinBottle(){

const player = players[Math.floor(Math.random()*players.length)]

showBottleResult(player)

}

function showBottleResult(player){

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${player}</h2>

<button onclick="spinBottle()">${t.next}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}
