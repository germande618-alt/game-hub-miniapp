// 🔧 ТВОИ ПЕРЕМЕННЫЕ (оставляем)
let deck = []
let trump = null
let tableCards = []

let socket = new WebSocket("wss://game-hub-miniapp-production.up.railway.app")

let roomID = null
let currentGame = null
let playerName = ""
let isHost = false

let selectedCard = null
let selectedElement = null

socket.onopen = () => {
  console.log("Connected")
}

socket.onmessage = (event) => {

  const data = JSON.parse(event.data)
  console.log("SERVER:", data)

  // 🃏 ОБНОВЛЕНИЕ
  if (data.type === "update_state") {

    tableCards = data.table
    renderTable()

    window.yourTurn = data.yourTurn

    if (data.cards) {
      renderHand(data.cards)
    }

    if (data.trump) {
      trump = data.trump
      renderTrump()
    }

    const actions = document.getElementById("actions")
    if(actions){
      actions.style.display = data.yourTurn ? "block" : "none"
    }
  }

  // 🎴 ТВОИ КАРТЫ
  if (data.type === "your_cards") {

    let enemyCount = 6

    let enemyCards = ""
    for (let i = 0; i < enemyCount; i++) {
      enemyCards += `<div class="card"><img src="cards/back.png"></div>`
    }

    const cardsHTML = data.cards.map((card, i) => {
      return `
        <div class="card"
          style="
            left: calc(50% + ${(i - (data.cards.length - 1)/2) * 40}px);
            transform: translateX(-50%) rotate(${(i - (data.cards.length - 1)/2) * 10}deg);
          "
          onclick="selectCard('${card}', this)"
        >
          <img src="${getCardImage(card)}">
        </div>
      `
    }).join("")

    // 🔥 ВАЖНО — КНОПКИ ВНУТРИ HTML
    document.getElementById("app").innerHTML = `
      <div id="table">

        <div id="enemy">${enemyCards}</div>

        <div id="board">
          <div id="deck"></div>
          <div id="trump"></div>
        </div>

        <div id="player">${cardsHTML}</div>

        <div id="actions" style="position:absolute; bottom:120px; left:50%; transform:translateX(-50%); display:none;">
          <button onclick="takeCards()">Беру</button>
          <button onclick="endRound()">Бито</button>
        </div>

      </div>
    `

    trump = data.trump
    renderTrump()
  }

  // 🏠 КОМНАТА
  if (data.type === "room_created") {
    roomID = data.code
    isHost = true
    askName()
  }

  if (data.type === "joined") {
    roomID = data.code
    isHost = false
    askName()
  }

  if (data.type === "players") {

    let html = "<h2>Комната " + roomID + "</h2>"
    html += "<h3>Игроки:</h3>"

    data.players.forEach((p,i)=>{
      html += "<p>" + (i+1) + ". " + p + "</p>"
    })

    if(isHost){
      html += "<button onclick='startGame()'>🎮 Начать игру</button>"
    }

    html += "<button onclick='openOnline()'>⬅️ Назад</button>"

    document.getElementById("app").innerHTML = html
  }
}

// 🧠 ВЫБОР
function selectCard(card, el){

  if (window.yourTurn === false) return

  if(selectedCard === card){
    playCard(card, el)
    selectedCard = null
    selectedElement = null
    return
  }

  if(selectedElement){
    selectedElement.style.transform =
      selectedElement.style.transform.replace(" translateY(-30px)", "")
  }

  selectedCard = card
  selectedElement = el

  el.style.transform += " translateY(-30px)"
}

// 🎮 ХОД
function playCard(card, el){

  console.log("PLAY:", card)

  const rect = el.getBoundingClientRect()

  const fly = document.createElement("img")
  fly.src = getCardImage(card)

  fly.style.position = "fixed"
  fly.style.left = rect.left + "px"
  fly.style.top = rect.top + "px"
  fly.style.width = rect.width + "px"
  fly.style.height = rect.height + "px"
  fly.style.transition = "0.4s"
  fly.style.zIndex = "999"

  document.body.appendChild(fly)

  setTimeout(() => {
    fly.style.left = "50%"
    fly.style.top = "40%"
    fly.style.transform = "translate(-50%, -50%) scale(0.7)"
  }, 10)

  setTimeout(() => {
    fly.remove()
  }, 400)

  // ❗ УБРАЛ el.remove() → теперь карта не исчезает сама

  socket.send(JSON.stringify({
    type:"card_played",
    card:card
  }))
}

// 🃏 СТОЛ (оставляем твой)
function renderTable() {
  const board = document.getElementById("board")
  if (!board) return

  board.innerHTML = `
    <div id="deck"></div>
    <div id="trump"></div>
  `

  tableCards.forEach((pair, i) => {
    if (!pair || !pair.attack) return

    const attack = document.createElement("div")
    attack.className = "card"
    attack.innerHTML = `<img src="${getCardImage(pair.attack)}">`

    attack.style.left = "50%"
    attack.style.top = "50%"
    attack.style.position = "absolute"
    attack.style.transform = `translate(${i * 60 - 100}px, -20px)`

    board.appendChild(attack)

    if (pair.defense) {
      const defense = document.createElement("div")
      defense.className = "card"
      defense.innerHTML = `<img src="${getCardImage(pair.defense)}">`

      defense.style.left = "50%"
      defense.style.top = "50%"
      defense.style.position = "absolute"
      defense.style.transform = `translate(${i * 60 - 80}px, 20px) rotate(10deg)`

      board.appendChild(defense)
    }
  })

  renderTrump()
}

// 🂡 КОЗЫРЬ
function renderTrump() {
  const el = document.getElementById("trump")
  if (!el || !trump) return
  el.innerHTML = `<img src="${getCardImage(trump)}">`
}

// 🎮 КНОПКИ
function takeCards(){
  socket.send(JSON.stringify({ type: "take_cards" }))
}

function endRound(){
  socket.send(JSON.stringify({ type: "end_round" }))
}
