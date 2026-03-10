function startCoupleQuestions(){

players=[]
currentPlayer=0

showPlayersQuestions()

}

function showPlayersQuestions(){

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${t.playerName}</h2>

<input id="playerInput" placeholder="${t.playerName}">

<button onclick="addPlayerQuestions()">${t.addPlayer}</button>

<div id="playersList"></div>

<button onclick="startQuestionsGame()">${t.start}</button>

<button onclick="openCouple()">⬅ ${t.back}</button>

`

}

function addPlayerQuestions(){

const input=document.getElementById("playerInput")
const name=input.value.trim()

if(name==="") return

players.push(name)

input.value=""

updatePlayersQuestions()

}

function updatePlayersQuestions(){

const list=document.getElementById("playersList")

list.innerHTML=""

players.forEach(p=>{
list.innerHTML+=`<div class="player">${p}</div>`
})

}

function startQuestionsGame(){

if(players.length===0) return

currentPlayer=0

showQuestionTurn()

}

function showQuestionTurn(){

const player=players[currentPlayer]
const list=coupleQuestions[lang] || coupleQuestions.en

const question=list[Math.floor(Math.random()*list.length)]

const t=translations[lang]

document.getElementById("app").innerHTML=`

<div class="playerName">${player}</div>

<div class="questionCard">${question}</div>

<button onclick="nextQuestionPlayer()">${t.next}</button>

<button onclick="openCouple()">⬅ ${t.back}</button>

`

}

function nextQuestionPlayer(){

currentPlayer++

if(currentPlayer>=players.length){
currentPlayer=0
}

showQuestionTurn()

}
