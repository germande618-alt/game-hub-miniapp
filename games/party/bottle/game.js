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

let bottleRotation = 0

function spinBottle(){

const bottle = document.getElementById("bottle")

const randomRotation = 720 + Math.random()*360

bottleRotation += randomRotation

bottle.style.transform = `translate(-50%,-50%) rotate(${bottleRotation}deg)`

setTimeout(()=>{
findClosestPlayer()
},3000)

}

function findClosestPlayer(){

const bottle = document.getElementById("bottle")

const bottleRect = bottle.getBoundingClientRect()

const bottleX = bottleRect.left + bottleRect.width/2
const bottleY = bottleRect.top

let closestPlayer = null
let minDistance = Infinity

document.querySelectorAll(".circlePlayer").forEach(player=>{

const rect = player.getBoundingClientRect()

const x = rect.left + rect.width/2
const y = rect.top + rect.height/2

const distance = Math.hypot(x-bottleX,y-bottleY)

if(distance < minDistance){
minDistance = distance
closestPlayer = player
}

const result = document.getElementById("bottleResult")

if(closestPlayer){

closestPlayer.classList.add("activePlayer")

if(result){
result.innerText = "👉 " + closestPlayer.innerText
}

}

})

document.querySelectorAll(".circlePlayer").forEach(p=>{
p.classList.remove("activePlayer")
})

if(closestPlayer){
closestPlayer.classList.add("activePlayer")
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

function showBottleGame(){

const t = translations[lang]

let playersHTML=""

players.forEach((p,i)=>{

const angle = (360/players.length)*i

playersHTML += `
<div class="circlePlayer player-${i}" 
style="transform: translate(-50%,-50%) rotate(${angle}deg) translate(140px) rotate(-${angle}deg)">
${p}
</div>
`

})

document.getElementById("app").innerHTML=`

<div class="bottleCircle">

${playersHTML}

<div class="bottlePointer">▲</div>

<div id="bottle">🍾</div>

<div id="bottleResult"></div>

</div>

<button onclick="spinBottle()">${t.start}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

}

function spinBottleAnimation(player){

const bottle = document.getElementById("bottle")
const playerText = document.getElementById("bottlePlayer")

const randomRotation = 360 * 5 + Math.floor(Math.random()*360)

bottle.style.transform = `rotate(${randomRotation}deg)`

setTimeout(()=>{

playerText.innerText = player

},2000)

}
