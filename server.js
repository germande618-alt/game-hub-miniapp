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

        let data
        try {
            data = JSON.parse(message)
        } catch {
            return
        }

        // 🏠 СОЗДАТЬ КОМНАТУ
        if(data.type === "create"){

            const code = Math.random().toString(36).substring(2,6).toUpperCase()

            rooms[code] = {
                clients: [ws],
                game: null
            }

            ws.room = code

            ws.send(JSON.stringify({
                type:"room_created",
                code:code
            }))

            console.log("Room created:", code)
        }

        // 🚪 ВОЙТИ В КОМНАТУ
        if(data.type === "join"){

            const code = data.code.toUpperCase()

            if(!rooms[code]){
                ws.send(JSON.stringify({
                    type:"error",
                    message:"room_not_found"
                }))
                return
            }

            rooms[code].clients.push(ws)
            ws.room = code

            ws.send(JSON.stringify({
                type:"joined",
                code:code
            }))

            console.log("Player joined:", code)
        }

        // 👤 УСТАНОВИТЬ ИМЯ
        if(data.type === "set_name"){

            ws.name = data.name

            const room = ws.room
            if(!room || !rooms[room]) return

            const players = rooms[room].clients.map(client => client.name || "Игрок")

            rooms[room].clients.forEach(client=>{
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type:"players",
                        players:players
                    }))
                }
            })

            console.log("Players:", players)
        }

        // ▶️ СТАРТ ИГРЫ
        if(data.type === "start_game"){

            const room = ws.room
            if(!room || !rooms[room]) return

            const roomData = rooms[room]
            const deck = createDeck()

            roomData.game = {
                players: roomData.clients.map(client => ({
                    ws: client,
                    cards: deck.splice(0,6)
                })),
                table: [],
                deck: deck,
                turn: 0
            }

            // отправляем карты
            roomData.game.players.forEach((player, i)=>{
                player.ws.send(JSON.stringify({
                    type:"your_cards",
                    cards: player.cards,
                    yourTurn: i === 0
                }))
            })

            console.log("Game started:", room)
        }

        // 🃏 ХОД КАРТОЙ
        if(data.type === "card_played"){

            const room = ws.room
            if(!room || !rooms[room] || !rooms[room].game) return

            const game = rooms[room].game

            const playerIndex = game.players.findIndex(p => p.ws === ws)
            if(playerIndex !== game.turn) return

            const player = game.players[playerIndex]

            // удалить ОДНУ карту
            const index = player.cards.indexOf(data.card)
            if(index === -1) return
            player.cards.splice(index, 1)

            // логика стола
            if(game.table.length === 0){
                game.table.push({ attack: data.card, defense: null })
            } else {
                const last = game.table[game.table.length - 1]

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

            // отправка состояния
            game.players.forEach((p, i)=>{
                if(p.ws.readyState === WebSocket.OPEN){
                    p.ws.send(JSON.stringify({
                        type:"update_state",
                        table: game.table,
                        cards: p.cards,
                        yourTurn: i === game.turn,
                        deckCount: game.deck.length
                    }))
                }
            })
        }

    })

    // ❌ ОТКЛЮЧЕНИЕ
    ws.on("close", () => {

        const room = ws.room

        if(room && rooms[room]){

            // удалить из clients
            rooms[room].clients = rooms[room].clients.filter(c => c !== ws)

            // удалить из игры если есть
            if(rooms[room].game){
                rooms[room].game.players =
                    rooms[room].game.players.filter(p => p.ws !== ws)
            }

            // если пусто — удалить комнату
            if(rooms[room].clients.length === 0){
                delete rooms[room]
                console.log("Room deleted:", room)
            }
        }

        console.log("Player disconnected")
    })

})
