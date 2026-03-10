function startNever(){

players=[]
currentPlayer=0

showPlayersNever()

}

function showPlayersNever(){

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${t.playerName}</h2>

<input id="playerInput" placeholder="${t.playerName}">

<button onclick="addPlayerNever()">${t.addPlayer}</button>

<div id="playersList"></div>

<button onclick="startNeverGame()">${t.start}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}

function addPlayerNever(){

const input=document.getElementById("playerInput")
const name=input.value.trim()

if(name==="") return

players.push(name)

input.value=""

updatePlayersNever()

}

function updatePlayersNever(){

const list=document.getElementById("playersList")

list.innerHTML=""

players.forEach(p=>{
list.innerHTML+=`<div class="player">${p}</div>`
})

}

function startNeverGame(){

if(players.length===0) return

currentPlayer=0

showNeverCard()

}

function showNeverCard(){

const list = neverCards[lang] || neverCards.en
const card = list[Math.floor(Math.random()*list.length)]

const t = translations[lang]

document.getElementById("app").innerHTML=`

<div class="questionCard">${card}</div>

<button onclick="showNeverCard()">${t.next}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}
