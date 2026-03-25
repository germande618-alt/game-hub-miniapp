const WebSocket = require("ws")

const PORT = process.env.PORT || 8080
const wss = new WebSocket.Server({ port: PORT })

let rooms = {}

function createDeck(){
    const suits = ["♠","♥","♦","♣"]
    const values = ["6","7","8","9","10","J","Q","K","A"]

    let deck = []

    suits.forEach(suit=>{
        values.forEach(value=>{
            deck.push(value + suit)
        })
    })

    return deck.sort(()=>Math.random()-0.5)
}

console.log("Server started on port", PORT)

wss.on("connection", ws => {

    console.log("Player connected")

    ws.on("message", message => {

        const data = JSON.parse(message)

        // создать комнату
        if(data.type === "create"){

            const code = Math.random().toString(36).substring(2,6).toUpperCase()

            rooms[code] = []
            rooms[code].push(ws)

            ws.room = code

            ws.send(JSON.stringify({
                type:"room_created",
                code:code
            }))

            console.log("Room created:", code)
        }

        // войти в комнату
        if(data.type === "join"){

            const code = data.code.toUpperCase()

            if(!rooms[code]){
                ws.send(JSON.stringify({
                    type:"error",
                    message:"room_not_found"
                }))
                return
            }

            rooms[code].push(ws)
            ws.room = code

            ws.send(JSON.stringify({
                type:"joined",
                code:code
            }))

            console.log("Player joined:", code)
        }

        // 🔥 СОХРАНИТЬ ИМЯ (ГЛАВНОЕ)
        if(data.type === "set_name"){

            ws.name = data.name

            const room = ws.room
            if(!room) return

            const players = rooms[room].map(client => client.name || "Игрок")

            rooms[room].forEach(client=>{
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type:"players",
                        players:players
                    }))
                }
            })

            console.log("Players updated:", players)
        }

    // старт игры
if(data.type === "start_game"){

    const room = ws.room
    if(!room) return

    const deck = createDeck()

    rooms[room] = {
        players: rooms[room].map(client => ({
            ws: client,
            cards: deck.splice(0,6)
        })),
        table: [],
        deck: deck,
        turn: 0 // 0 = первый игрок атакует
    }

    // отправляем карты
    rooms[room].players.forEach((player, i)=>{
        player.ws.send(JSON.stringify({
            type:"your_cards",
            cards: player.cards,
            yourTurn: i === 0
        }))
    })

    console.log("Game started:", room)
}

    // перемешать
    deck.sort(()=>Math.random()-0.5)

    // раздать карты
    rooms[room].players = rooms[room].map(client=>({
        ws: client,
        cards: deck.splice(0,6)
    }))

    // отправить каждому его карты
    rooms[room].players.forEach(player=>{
        player.ws.send(JSON.stringify({
            type:"your_cards",
            cards: player.cards
        }))
    })

    console.log("Game started in room:", room)
}

if(data.type === "card_played"){

    const room = ws.room
    if(!room) return

    const game = rooms[room]

    const playerIndex = game.players.findIndex(p => p.ws === ws)
    if(playerIndex !== game.turn) return // ❌ не твой ход

    const player = game.players[playerIndex]

    // убираем карту из руки
    player.cards = player.cards.filter(c => c !== data.card)

    // если стол пуст — атака
    if(game.table.length === 0){
        game.table.push({ attack: data.card, defense: null })
    } else {
        const last = game.table[game.table.length - 1]

        // защита
        if(!last.defense){
            last.defense = data.card

            // смена хода
            game.turn = (game.turn + 1) % game.players.length

            // добор карт
            game.players.forEach(p=>{
                while(p.cards.length < 6 && game.deck.length > 0){
                    p.cards.push(game.deck.pop())
                }
            })
        } else {
            game.table.push({ attack: data.card, defense: null })
        }
    }

    // отправка ВСЕМ
    game.players.forEach((p, i)=>{
        p.ws.send(JSON.stringify({
            type:"update_state",
            table: game.table,
            cards: p.cards,
            yourTurn: i === game.turn,
            deckCount: game.deck.length
        }))
    })
}

    ws.on("close", () => {

        const room = ws.room

        if(room && rooms[room]){
            rooms[room] = rooms[room].filter(client => client !== ws)

            if(rooms[room].length === 0){
                delete rooms[room]
                console.log("Room deleted:", room)
            }
        }

        console.log("Player disconnected")
    })

})
