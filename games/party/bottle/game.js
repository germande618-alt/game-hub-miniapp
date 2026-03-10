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

<div class="bottleArea">

<img id="bottle" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bottle_icon.svg/512px-Bottle_icon.svg.png">

</div>

<h2 id="bottlePlayer"></h2>

<button onclick="spinBottleAnimation()">${t.start}</button>

<button onclick="openParty()">⬅ ${t.back}</button>

`

spinBottleAnimation(player)

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
