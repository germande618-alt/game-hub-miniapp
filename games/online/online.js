console.log("ONLINE LOADED")

let socket = new WebSocket("wss://game-hub-miniapp-production.up.railway.app")

let roomID = null
let currentGame = null
let playerName = ""
let isHost = false

socket.onopen = () => {
    console.log("Connected")
}

socket.onmessage = (event) => {

    const data = JSON.parse(event.data)
    console.log("SERVER:", data)

    if(data.type === "your_cards"){

        let enemyCount = 6

        document.getElementById("app").innerHTML = `

        <div id="table">

            <div id="enemy">
                👤 Противник (${enemyCount})
            </div>

            <div id="board"></div>

            <div id="player">
                ${data.cards.map(card => 
                    <div class="card" onclick="playCard('${card}')">${card}</div>
                ).join("")}
            </div>

        </div>

        `
    }

    if(data.type === "card_played"){

        document.getElementById("board").innerHTML +=
            <div class="card">${data.card}</div>
    }

    // создали комнату
    if(data.type === "room_created"){
        roomID = data.code
        isHost = true
        askName()
    }

    // вошли в комнату
    if(data.type === "joined"){
        roomID = data.code
        isHost = false
        askName()
    }

    // список игроков
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

    socket.send(JSON.stringify({
        type:"create"
    }))
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

function playCard(card){

    socket.send(JSON.stringify({
        type:"play_card",
        card:card
    }))

}

function startGame(){
    socket.send(JSON.stringify({
        type:"start_game"
    }))
}
