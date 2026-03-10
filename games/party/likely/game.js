function startLikely(){

players=[]
currentPlayer=0

showPlayersLikely()

}

function showPlayersLikely(){

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${t.playerName}</h2>

<input id="playerInput" placeholder="${t.playerName}">

<button onclick="addPlayerLikely()">${t.addPlayer}</button>

<div id="playersList"></div>

<button onclick="startLikelyGame()">${t.start}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}

function addPlayerLikely(){

const input=document.getElementById("playerInput")
const name=input.value.trim()

if(name==="") return

players.push(name)

input.value=""

updatePlayersLikely()

}

function updatePlayersLikely(){

const list=document.getElementById("playersList")

list.innerHTML=""

players.forEach(p=>{
list.innerHTML+=`<div class="player">${p}</div>`
})

}

function startLikelyGame(){

if(players.length===0) return

showLikelyCard()

}

function showLikelyCard(){

const list = likelyCards[lang] || likelyCards.en
const card = list[Math.floor(Math.random()*list.length)]

const t = translations[lang]

document.getElementById("app").innerHTML=`

<div class="questionCard">${card}</div>

<button onclick="showLikelyCard()">${t.next}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}
