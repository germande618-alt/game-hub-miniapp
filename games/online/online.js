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

window.gameStarted = false;

socket.onopen = () => {
  console.log("Connected");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("SERVER:", data);

  // 🃏 ИГРА
  if (data.type === "update_state") {
    window.gameStarted = true;

    tableCards = data.table;
    renderTable();

    window.yourTurn = data.yourTurn;

    if (data.cards) {
      renderHand(data.cards);
    }

    if (data.trump) {
      trump = data.trump;
      renderTrump();
    }

    // статус
    const status = document.getElementById("status");
    if (status) {
      status.innerText = data.yourTurn ? "Ваш ход" : "Ход противника";
      status.style.color = data.yourTurn ? "red" : "gray";
    }
  }

  // 🎴 ТВОИ КАРТЫ
  if (data.type === "your_cards") {
    let enemyCount = 6;

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

    const cardsHTML = data.cards.map((card, i) => {
      return `
        <div class="card"
          style="
            left: calc(50% + ${(i - (data.cards.length - 1)/2) * 40}px);
            transform: translateX(-50%);
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

      <div id="hud">
        <div id="status">Ваш ход</div>

        <div id="actions">
          <button onclick="takeCards()">Беру</button>
          <button onclick="endRound()">Бито</button>
        </div>
      </div>
    `;

    renderTrump();
  }

  // 🏠 СОЗДАНИЕ
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
  if (data.type === "players" && !window.gameStarted) {
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

// 🧠 ВЫБОР
function selectCard(card, el) {
  if (!window.yourTurn) return;

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
  if (!card || typeof card !== "string") return "cards/back.png";

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

// 🎮 ХОД
function playCard(card, el) {
  socket.send(JSON.stringify({
    type:"card_played",
    card:card
  }));
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
    if (!pair || !pair.attack) return;

    const attack = document.createElement("div");
    attack.className = "card";
    attack.innerHTML = `<img src="${getCardImage(pair.attack)}">`;

    attack.style.position = "absolute";
    attack.style.left = "50%";
    attack.style.top = "50%";
    attack.style.transform = `translate(${i * 40}px, 0px)`;

    board.appendChild(attack);

    if (pair.defense) {
      const defense = document.createElement("div");
      defense.className = "card";
      defense.innerHTML = `<img src="${getCardImage(pair.defense)}">`;

      defense.style.position = "absolute";
      defense.style.left = "50%";
      defense.style.top = "50%";
      defense.style.transform = `translate(${i * 40 + 20}px, 20px)`;

      board.appendChild(defense);
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

// ДЕЙСТВИЯ
function takeCards(){
  socket.send(JSON.stringify({ type: "take_cards" }));
}

function endRound(){
  socket.send(JSON.stringify({ type: "end_round" }));
}

// ▶️ СТАРТ
function startGame() {
  console.log("🔥 START CLICK");
  window.gameStarted = true;

  socket.send(JSON.stringify({
    type: "start_game"
  }));
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
  socket.send(JSON.stringify({ type:"create" }));
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
    type:"join",
    code:code
  }));
}

function askName() {
  document.getElementById("app").innerHTML = `
    <h2>Введите имя</h2>
    <input id="nameInput">
    <button onclick="sendName()">Продолжить</button>
  `;
}

function renderHand(cards){
  const player = document.getElementById("player");
  if(!player) return;

  player.innerHTML = cards.map((card, i) => `
    <div class="card"
      style="left: calc(50% + ${(i - (cards.length - 1)/2) * 40}px);"
      onclick="selectCard('${card}', this)"
    >
      <img src="${getCardImage(card)}">
    </div>
  `).join("");
}

function sendName() {
  const input = document.getElementById("nameInput");
  playerName = input.value || "Игрок";

  socket.send(JSON.stringify({
    type:"set_name",
    name:playerName
  }));

  document.getElementById("app").innerHTML = `
    <h2>Комната ${roomID}</h2>
    <p>Ожидание игроков...</p>
  `;
}
