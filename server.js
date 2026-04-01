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

function canBeat(attack, defense, trump){
    const order = ["6","7","8","9","10","J","Q","K","A"]

    const av = attack.slice(0,-1)
    const as = attack.slice(-1)

    const dv = defense.slice(0,-1)
    const ds = defense.slice(-1)

    if(as === ds){
        return order.indexOf(dv) > order.indexOf(av)
    }

    if(ds === trump && as !== trump){
        return true
    }

    return false
}

function broadcastPlayers(room){
    const players = rooms[room].clients.map(c=>c.name || "Игрок")

    rooms[room].clients.forEach(c=>{
        c.send(JSON.stringify({
            type:"players",
            players
        }))
    })
}

wss.on("connection", ws => {

    ws.on("message", message => {

        let data
        try {
            data = JSON.parse(message)
        } catch {
            return
        }

        if(data.type === "create"){
            const code = Math.random().toString(36).substring(2,6).toUpperCase()

            rooms[code] = {
                clients: [ws],
                game: null
            }

            ws.room = code

            ws.send(JSON.stringify({
                type:"room_created",
                code
            }))
        }

        if(data.type === "join"){
            const room = rooms[data.code]
            if(!room) return

            room.clients.push(ws)
            ws.room = data.code

            ws.send(JSON.stringify({
                type:"joined",
                code:data.code
            }))

            broadcastPlayers(data.code)
        }

        if(data.type === "set_name"){
            ws.name = data.name

            if(ws.room){
                broadcastPlayers(ws.room)
            }
        }

        if(data.type === "start_game"){
            const room = ws.room
            if(!room || !rooms[room]) return

            const deck = createDeck()

            const trumpCard = deck[deck.length - 1]
            const trumpSuit = trumpCard.slice(-1)

            rooms[room].game = {
                players: rooms[room].clients.map(c => ({
                    ws: c,
                    cards: deck.splice(0,6)
                })),
                table: [],
                deck,
                trump: trumpSuit,
                attackIndex: 0,
                defendIndex: 1,
                phase: "attack"
            }

            sendState(room)
        }

        if(data.type === "card_played"){
            const game = rooms[ws.room]?.game
            if(!game) return

            const i = game.players.findIndex(p => p.ws === ws)
            const player = game.players[i]

            const index = player.cards.indexOf(data.card)
            if(index === -1) return

            let played = false

            if(game.phase === "attack"){
                if(i !== game.attackIndex) return

                game.table.push({ attack: data.card, defense: null })
                game.phase = "defense"
                played = true
            }
            else if(game.phase === "defense"){
                if(i !== game.defendIndex) return

                const last = game.table.find(p => !p.defense)
                if(!last) return

                if(!canBeat(last.attack, data.card, game.trump)) return

                last.defense = data.card

                if(game.table.every(p => p.defense)){
                    game.phase = "attack"
                }

                played = true
            }

            if(played){
                player.cards.splice(index, 1)
            }

            sendState(ws.room)
        }

        if(data.type === "take_cards"){
            const game = rooms[ws.room]?.game
            if(!game) return

            const defender = game.players[game.defendIndex]

            game.table.forEach(p=>{
                if(p.attack) defender.cards.push(p.attack)
                if(p.defense) defender.cards.push(p.defense)
            })

            game.table = []
            game.phase = "attack"

            sendState(ws.room)
        }
    })
})

function sendState(room){
    const game = rooms[room].game

    game.players.forEach((p,i)=>{
        p.ws.send(JSON.stringify({
            type:"update_state",
            table: game.table,
            cards: p.cards,
            trump: game.trump,
            yourTurn:
                (game.phase === "attack" && i === game.attackIndex) ||
                (game.phase === "defense" && i === game.defendIndex)
        }))
    })
}
