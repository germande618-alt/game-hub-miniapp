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
if (data.type === "card_played") {

    // ❗ если игры ещё нет — игнорируем
    if (!document.getElementById("board")) return

    tableCards.push({
        attack: data.card,
        defense: null
    });

    renderTable();
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

  // если уже формат нормальный (6♥)
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

    const suitName = suits[suit] || "";
    const valueName = values[value] || value;

    const suffix = ["jack", "queen", "king"].includes(valueName) ? "2" : "";

    return `cards/${valueName}_of_${suitName}${suffix}.png`;
  }

  // если формат типа 10_of_hearts
  if (card.includes("_of_")) {
    return `cards/${card}.png`;
  }

  // fallback (если вообще непонятно)
  console.log("UNKNOWN CARD FORMAT:", card);
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

 el.style.opacity = "0.3"

  socket.send(JSON.stringify({
    type:"card_played",
    card:card
}))

tableCards.push({
    attack: card,
    defense: null
})

renderTable()
  
}

// 🃏 СТОЛ
function renderTable() {
  const board = document.getElementById("board");
  if (!board) return;

  board.innerHTML = `
    <div id="deck"></div>
    <div id="trump"></div>
  `;

  tableCards.forEach((pair, i) => {

  const col = i % 3        // колонка (0,1,2)
  const row = Math.floor(i / 3)  // ряд (0,1)

  const x = col * 80
  const y = row * 120

  // атака
  const attack = document.createElement("div")
  attack.className = "card"
  attack.innerHTML = `<img src="${getCardImage(pair.attack)}">`

  attack.style.left = x + "px"
  attack.style.top = y + "px"

  board.appendChild(attack)

  // защита
  if (pair.defense) {
    const defense = document.createElement("div")
    defense.className = "card"
    defense.innerHTML = `<img src="${getCardImage(pair.defense)}">`

    defense.style.left = (x + 20) + "px"
    defense.style.top = (y + 20) + "px"
    defense.style.transform = "rotate(10deg)"

    board.appendChild(defense)
  }
});

  renderTrump();
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
