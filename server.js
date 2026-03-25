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

    // создаем колоду
    const suits = ["♠","♥","♦","♣"]
    const values = ["6","7","8","9","10","J","Q","K","A"]

    let deck = []

    suits.forEach(suit=>{
        values.forEach(value=>{
            deck.push(value + suit)
        })
    })

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

    if(!rooms[room].table){
        rooms[room].table = []
    }

    rooms[room].table.push({
        attack: data.card,
        defense: null
    })

    rooms[room].forEach(client => {
        client.send(JSON.stringify({
            type: "update_state",
            table: rooms[room].table
        }))
    })

}

    })

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
