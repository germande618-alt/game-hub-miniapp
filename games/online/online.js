let deck = [];
let trump = null;
let tableCards = [];

console.log("ONLINE LOADED");

let socket = new WebSocket("wss://game-hub-miniapp-production.up.railway.app");

let roomID = null;
let currentGame = null;
let playerName = "";
let isHost = false;

let selectedCard = null;
let selectedElement = null;

socket.onopen = () => {
  console.log("Connected");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("SERVER:", data);

  // 🃏 ХОД
if (data.type === "update_state") {
    tableCards = data.table
    renderTable()

    window.yourTurn = data.yourTurn

    // обновляем руку
    if (data.cards) {
        renderHand(data.cards)
    }
}

  // 🂡 КОЗЫРЬ
  if (data.type === "start") {
    trump = data.trump;
    renderTrump();
  }

  // 🎴 ТВОИ КАРТЫ
  if (data.type === "your_cards") {
    let enemyCount = 6;

    // 👤 ВРАГ (рубашки)
    let enemyCards = "";
    for (let i = 0; i < enemyCount; i++) {
      enemyCards += `
        <div class="card"
          style="
            left: calc(50% + ${(i - (enemyCount - 1)/2) * 20}px);
            transform: translateX(-50%);
          "
        >
          <img src="cards/back.png">
        </div>
      `;
    }

    // 🧍 ТВОИ КАРТЫ
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
      `;
    }).join("");

    document.getElementById("app").innerHTML = `
      <div id="table">
        <div id="enemy">${enemyCards}</div>

        <div id="board">
          <div id="deck"></div>
          <div id="trump"></div>
        </div>

        <div id="player">${cardsHTML}</div>
      </div>
    `;

    renderTrump();
  }

  // 🏠 СОЗДАНИЕ КОМНАТЫ
  if (data.type === "room_created") {
    roomID = data.code;
    isHost = true;
    askName();
  }

  // 🔑 ВХОД
  if (data.type === "joined") {
    roomID = data.code;
    isHost = false;
    askName();
  }

  // 👥 СПИСОК ИГРОКОВ
  if (data.type === "players") {
    let html = `<h2>Комната ${roomID}</h2>`;
    html += `<h3>Игроки:</h3>`;

    data.players.forEach((p, i) => {
      html += `<p>${i + 1}. ${p}</p>`;
    });

    if (isHost) {
      html += `<button onclick="startGame()">🎮 Начать игру</button>`;
    }

    html += `<button onclick="openOnline()">⬅️ Назад</button>`;
    document.getElementById("app").innerHTML = html;
  }
};

// 🧠 ВЫБОР КАРТЫ
function selectCard(card, el) {
  if (selectedCard === card) {
    playCard(card, el);
    selectedCard = null;
    selectedElement = null;
    return;
  }

  if (window.yourTurn === false) return;

  if (!canPlay(card)) return;

  if (selectedElement) {
    selectedElement.style.transform =
      selectedElement.style.transform.replace(" translateY(-30px)", "");
  }

  selectedCard = card;
  selectedElement = el;

  el.style.transform += " translateY(-30px)";
}

// 🎯 КАРТИНКА
function getCardImage(card) {

  // если формат типа "Q♠"
  if (card.includes("♥") || card.includes("♦") || card.includes("♠") || card.includes("♣")) {

    const value = card.slice(0, -1);
    const suit = card.slice(-1);

    const suits = {
      "♥": "hearts",
      "♦": "diamonds",
      "♠": "spades",
      "♣": "clubs"
    };

    const values = {
      "J": "jack",
      "Q": "queen",
      "K": "king",
      "A": "ace"
    };

    const suitName = suits[suit];
    const valueName = values[value] || value;

    return `cards/${valueName}_of_${suitName}.png`;
  }

  // если уже формат "queen_of_spades"
  if (card.includes("_of_")) {
    return `cards/${card}.png`;
  }

  console.log("UNKNOWN CARD:", card);
  return "cards/back.png";
}

// 🎮 ХОД
function playCard(card, el) {
  const rect = el.getBoundingClientRect();

  const fly = document.createElement("img");
  fly.src = getCardImage(card);

  fly.style.position = "fixed";
  fly.style.left = rect.left + "px";
  fly.style.top = rect.top + "px";
  fly.style.width = rect.width + "px";
  fly.style.height = rect.height + "px";
  fly.style.transition = "0.4s";
  fly.style.zIndex = "999";

  document.body.appendChild(fly);

  setTimeout(() => {
    fly.style.left = "50%";
    fly.style.top = "40%";
    fly.style.transform = "translate(-50%, -50%) scale(0.7)";
  }, 10);

  setTimeout(() => {
    fly.remove();
  }, 400);

 el.remove()

  socket.send(JSON.stringify({
    type:"card_played",
    card:card
}))
  
}

// 🃏 СТОЛ
function renderTable() {
  const board = document.getElementById("board")
  if (!board) return

  board.innerHTML = `
    <div id="deck"></div>
    <div id="trump"></div>
  `

  const cols = 3
  const rows = Math.ceil(tableCards.length / cols)

  tableCards.forEach((pair, i) => {

    // ❗ защита от undefined (убирает ❓)
    if (!pair || !pair.attack) return

    const col = i % cols
    const row = Math.floor(i / cols)

    // центрирование
    const offsetX = -((cols - 1) * 40)
    const offsetY = -((rows - 1) * 60)

    const x = col * 80 + offsetX
    const y = row * 120 + offsetY

    // 🃏 атака
    const attack = document.createElement("div")
    attack.className = "card"
    attack.innerHTML = `<img src="${getCardImage(pair.attack)}">`

    attack.style.position = "absolute"
    attack.style.left = "50%"
    attack.style.top = "50%"
    attack.style.transform = `translate(${x}px, ${y}px)`

    board.appendChild(attack)

    // 🛡 защита
    if (pair.defense) {
      const defense = document.createElement("div")
      defense.className = "card"
      defense.innerHTML = `<img src="${getCardImage(pair.defense)}">`

      defense.style.position = "absolute"
      defense.style.left = "50%"
      defense.style.top = "50%"
      defense.style.transform = `translate(${x + 20}px, ${y + 20}px) rotate(10deg)`

      board.appendChild(defense)
    }
  })

  renderTrump()
}

// 🂡 КОЗЫРЬ
function renderTrump() {
  const el = document.getElementById("trump");
  if (!el || !trump) return;

  el.innerHTML = `<img src="${getCardImage(trump)}">`;
}

// ▶️ СТАРТ
function startGame() {
  socket.send(JSON.stringify({ type: "start_game" }));
}

// UI
function openOnline() {
  document.getElementById("app").innerHTML = `
    <h2>Онлайн</h2>
    <button onclick="openGame('durak')">🃏 Дурак</button>
    <button onclick="openGame('mafia')">🕵️ Мафия</button>
    <button onclick="openGame('draw')">🎨 Рисуй</button>
    <button onclick="loadMain()">⬅️ Назад</button>
  `;
}

function openGame(game) {
  currentGame = game;

  document.getElementById("app").innerHTML = `
    <h2>${game}</h2>
    <button onclick="createRoom()">➕ Создать комнату</button>
    <button onclick="showJoin()">🔑 Войти</button>
    <button onclick="openOnline()">⬅️ Назад</button>
  `;
}

function createRoom() {
  socket.send(JSON.stringify({ type: "create" }));
}

function showJoin() {
  document.getElementById("app").innerHTML = `
    <h2>Введите код</h2>
    <input id="roomCode">
    <button onclick="joinRoom()">Войти</button>
    <button onclick="openOnline()">Назад</button>
  `;
}

function joinRoom() {
  const code = document.getElementById("roomCode").value.toUpperCase();

  socket.send(JSON.stringify({
    type: "join",
    code: code
  }));
}

function askName() {
  document.getElementById("app").innerHTML = `
    <h2>Введите имя</h2>
    <input id="nameInput">
    <button onclick="sendName()">Продолжить</button>
  `;
}

function canPlay(card) {

  // если стол пуст — можно любую
  if (tableCards.length === 0) return true

  // можно подкидывать только по значению
  const valuesOnTable = tableCards.flatMap(p => [
    p.attack,
    p.defense
  ]).filter(Boolean)

  const value = card.slice(0, -1)

  return valuesOnTable.some(c => c.startsWith(value))
}

function renderHand(cards){

    const player = document.getElementById("player")
    if(!player) return

    player.innerHTML = cards.map((card, i) => `
        <div class="card"
            style="
                left: calc(50% + ${(i - (cards.length - 1)/2) * 40}px);
                transform: translateX(-50%);
            "
            onclick="selectCard('${card}', this)"
        >
            <img src="${getCardImage(card)}">
        </div>
    `).join("")
}

function sendName() {
  const input = document.getElementById("nameInput");
  playerName = input.value || "Игрок";

  socket.send(JSON.stringify({
    type: "set_name",
    name: playerName
  }));

  document.getElementById("app").innerHTML = `
    <h2>Комната ${roomID}</h2>
    <p>Ожидание игроков...</p>
  `;
}
