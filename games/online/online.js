let socket = new WebSocket("wss://game-hub-miniapp-production.up.railway.app")

let roomID = null
let isHost = false
let selectedCard = null
let yourTurn = false
let trump = null
let tableCards = []

socket.onmessage = (event)=>{
  const data = JSON.parse(event.data)
  console.log("SERVER:", data)

  if(data.type === "room_created"){
    roomID = data.code
    isHost = true
    askName()
  }

  if(data.type === "joined"){
    roomID = data.code
    isHost = false
    askName()
  }

  if(data.type === "players"){
    let html = `<h2>Комната ${roomID}</h2>`

    data.players.forEach(p=>{
      html += `<p>${p}</p>`
    })

    if(isHost){
      html += `<button onclick="startGame()">Начать игру</button>`
    }

    document.getElementById("app").innerHTML = html
  }

  if(data.type === "update_state"){

    if(!document.getElementById("table")){
      document.getElementById("app").innerHTML = `
        <div id="table">
          <div id="board"></div>
          <div id="player"></div>
        </div>

        <div id="hud">
          <div id="status"></div>
          <button onclick="takeCards()">Беру</button>
        </div>
      `
    }

    yourTurn = data.yourTurn
    trump = data.trump
    tableCards = data.table

    document.getElementById("status").innerText =
      yourTurn ? "ТВОЙ ХОД" : "ЖДИ"

    renderHand(data.cards)
    renderTable()
  }
}

function startGame(){
  socket.send(JSON.stringify({type:"start_game"}))
}

function createRoom(){
  socket.send(JSON.stringify({type:"create"}))
}

function joinRoom(){
  const code = document.getElementById("roomCode").value
  socket.send(JSON.stringify({type:"join", code}))
}

function askName(){
  document.getElementById("app").innerHTML = `
    <input id="name">
    <button onclick="sendName()">OK</button>
  `
}

function sendName(){
  const name = document.getElementById("name").value || "Игрок"

  socket.send(JSON.stringify({
    type:"set_name",
    name
  }))
}

function renderHand(cards){
  const el = document.getElementById("player")

  el.innerHTML = cards.map(c=>`
    <div onclick="play('${c}')">${c}</div>
  `).join("")
}

function play(card){
  if(!yourTurn) return

  socket.send(JSON.stringify({
    type:"card_played",
    card
  }))
}

function renderTable(){
  const el = document.getElementById("board")

  el.innerHTML = tableCards.map(p=>`
    <div>${p.attack} ${p.defense || ""}</div>
  `).join("")
}

function takeCards(){
  socket.send(JSON.stringify({type:"take_cards"}))
}
