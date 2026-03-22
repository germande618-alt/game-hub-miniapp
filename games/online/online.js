let tableCards = []
console.log("ONLINE LOADED")

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

    if (data.type === "move") {
  tableCards.push(data.card)
  renderTable()
}

    if(data.type === "your_cards"){

        let enemyCount = 6

        const cardsHTML = data.cards.map((card, i) => {
            return `
                <div class="card"
                    style="
                        left: calc(50% + ${(i - (data.cards.length - 1)/2) * 40}px);
                        transform: translateX(-50%) rotate(${(i - (data.cards.length - 1)/2) * 10}deg);
                        z-index: ${i};
                    "
                    onclick="selectCard('${card}', this)"
                >
                    <img src="${getCardImage(card)}">
                </div>
            `
        }).join("")

        document.getElementById("app").innerHTML = `
            <div id="table">

                <div id="enemy">
                    👤 Противник (${enemyCount})
                </div>

                <div id="board">
                    <div id="deck"></div>
                    <div id="trump">
                        <img src="cards/6_of_hearts.png">
                    </div>
                </div>

                <div id="player">
                    ${cardsHTML}
                </div>

            </div>
        `
    }

    if (data.type === "card_played") {
    const board = document.getElementById("board")

    const cardEl = document.createElement("div")
    cardEl.className = "card"

    cardEl.innerHTML = `<img src="${getCardImage(data.card)}">`

    // 👉 добавляем позицию
    const index = board.children.length

    cardEl.style.left = (index * 40) + "px"
    cardEl.style.top = "0px"

    board.appendChild(cardEl)
}

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

// 🧠 ВЫБОР КАРТЫ
function selectCard(card, el){

    if(selectedCard === card){
        playCard(card, el)
        selectedCard = null
        selectedElement = null
        return
    }

    if(selectedElement){
        selectedElement.style.transform = selectedElement.style.transform.replace(" translateY(-30px)", "")
    }

    selectedCard = card
    selectedElement = el

    el.style.transform += " translateY(-30px)"
}

// 🎯 ПОЛУЧЕНИЕ КАРТИНКИ
function getCardImage(card){

    let value = card.slice(0, -1)
    const suit = card.slice(-1)

    let suitName = ""

    if(suit === "♥") suitName = "hearts"
    if(suit === "♦") suitName = "diamonds"
    if(suit === "♠") suitName = "spades"
    if(suit === "♣") suitName = "clubs"

    let valueName = value

    if(value === "J") valueName = "jack"
    if(value === "Q") valueName = "queen"
    if(value === "K") valueName = "king"
    if(value === "A") valueName = "ace"

    let suffix = ""

    if(["jack","queen","king"].includes(valueName)){
        suffix = "2"
    }

    return `cards/${valueName}_of_${suitName}${suffix}.png`
}

// 🎮 КИНУТЬ КАРТУ
function playCard(card, el){

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

    el.style.opacity = "0.3"

    socket.send(JSON.stringify({
        type:"play_card",
        card:card
    }))
}

// UI
function openOnline(){
    document.getElementById("app").innerHTML =
    "<h2>Онлайн</h2>" +
    "<button onclick=\"openGame('durak')\">🃏 Дурак</button>" +
    "<button onclick=\"openGame('mafia')\">🕵️ Мафия</button>" +
    "<button onclick=\"openGame('draw')\">🎨 Рисуй</button>" +
    "<button onclick=\"loadMain()\">⬅️ Назад</button>"
}

function openGame(game){
    currentGame = game

    document.getElementById("app").innerHTML =
    "<h2>" + game + "</h2>" +
    "<button onclick=\"createRoom()\">➕ Создать комнату</button>" +
    "<button onclick=\"showJoin()\">🔑 Войти</button>" +
    "<button onclick=\"openOnline()\">⬅️ Назад</button>"
}

function createRoom(){
    socket.send(JSON.stringify({ type:"create" }))
}

function showJoin(){
    document.getElementById("app").innerHTML =
    "<h2>Введите код</h2>" +
    "<input id='roomCode'>" +
    "<button onclick='joinRoom()'>Войти</button>" +
    "<button onclick='openOnline()'>Назад</button>"
}

function joinRoom(){
    const code = document.getElementById("roomCode").value.toUpperCase()

    socket.send(JSON.stringify({
        type:"join",
        code:code
    }))
}

function askName(){
    document.getElementById("app").innerHTML =
    "<h2>Введите имя</h2>" +
    "<input id='nameInput'>" +
    "<button onclick='sendName()'>Продолжить</button>"
}

function sendName(){
    const input = document.getElementById("nameInput")

    playerName = input.value || "Игрок"

    socket.send(JSON.stringify({
        type:"set_name",
        name:playerName
    }))

    document.getElementById("app").innerHTML =
    "<h2>Комната " + roomID + "</h2>" +
    "<p>Ожидание игроков...</p>"
}

function renderTable() {
  const board = document.getElementById("board")
  board.innerHTML = ""

  tableCards.forEach((card, i) => {
    const el = document.createElement("div")
    el.className = "card"
    el.innerHTML = `<img src="${getCardImage(card)}">`

    el.style.left = (i * 40) + "px"
    el.style.top = "0px"

    board.appendChild(el)
  })
}

function playCard(card) {
    tableCards.push(card)

    // удалить из руки
    playerHand = playerHand.filter(c => c !== card)

    renderHand()
    renderTable()

    socket.send(JSON.stringify({
        type: "move",
        card: card
    }))
}

function startGame(){
    socket.send(JSON.stringify({
        type:"start_game"
    }))
}
