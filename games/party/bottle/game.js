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

if(players.length === 0) return

showBottleGame()

}

let pointerRotation = 0

function spinBottle(){

const pointer = document.getElementById("pointer")

const randomRotation = 720 + Math.random()*360

pointerRotation += randomRotation

pointer.style.transform = `translateX(-50%) rotate(${pointerRotation}deg)`

setTimeout(()=>{
detectPlayer()
},3000)

}

function detectPlayer(){

const angle = pointerRotation % 360

const sector = 360 / players.length

const index = Math.floor(angle / sector)

document.querySelectorAll(".circlePlayer").forEach(p=>{
p.classList.remove("activePlayer")
})

const selected = document.querySelector(".player-"+index)

if(selected){
selected.classList.add("activePlayer")
}

}

function findClosestPlayer(){

const angle = bottleRotation % 360

const sector = 360 / players.length

let index = Math.round(angle / sector)

index = (players.length - index) % players.length

document.querySelectorAll(".circlePlayer").forEach(p=>{
p.classList.remove("activePlayer")
})

const selected = document.querySelector(".player-"+index)

const result = document.getElementById("bottleResult")

if(selected){

selected.classList.add("activePlayer")

if(result){
result.innerText = "👉 " + selected.innerText
}

}

}

function highlightClosestPlayer(){

const angle = bottleRotation % 360

const sector = 360 / players.length

const index = Math.round(angle / sector) % players.length

document.querySelectorAll(".circlePlayer").forEach(p=>{
p.classList.remove("activePlayer")
})

const selected = document.querySelector(".player-"+index)

if(selected){
selected.classList.add("activePlayer")
}

}

let rotation = 0

function showBottleGame(){

const t = translations[lang]

let playersHTML=""

players.forEach((p,i)=>{

const angle = (360/players.length)*i

playersHTML += `
<div class="circlePlayer player-${i}" 
style="transform: rotate(${angle}deg) translate(150px) rotate(-${angle}deg)">
${p}
</div>
`

})

document.getElementById("app").innerHTML = `

<div class="bottleCircle">

${playersHTML}

<div class="bottleCenter">

<div id="bottleWrapper">

<div id="pointer">▲</div>
<div id="bottle">🍾</div>

</div>

</div>

</div>

<div id="bottleResult"></div>

<button onclick="spinBottle()">${t.start}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}

function spinBottle(){

const wrapper = document.getElementById("bottleWrapper")

const randomRotation = 720 + Math.random()*360

rotation += randomRotation

wrapper.style.transform = `rotate(${rotation}deg)`

setTimeout(()=>{
highlightClosestPlayer()
},3000)

}

function highlightClosestPlayer(){

const angle = rotation % 360

const sector = 360 / players.length

const index = Math.round(angle / sector) % players.length

document.querySelectorAll(".circlePlayer").forEach(p=>{
p.classList.remove("activePlayer")
})

const selected = document.querySelector(".player-"+index)

const result = document.getElementById("bottleResult")

if(selected){

selected.classList.add("activePlayer")

if(result){
result.innerText = "👉 " + selected.innerText
}

}

}
