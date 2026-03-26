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

    // одна масть
    if(as === ds){
        return order.indexOf(dv) > order.indexOf(av)
    }

    // козырь
    if(ds === trump && as !== trump){
        return true
    }

    return false
}

console.log("Server started on port", PORT)

wss.on("connection", ws => {

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
                code
            }))
        }

        // 🚪 ВОЙТИ
        if(data.type === "join"){
            const room = rooms[data.code]
            if(!room) return

            room.clients.push(ws)
            ws.room = data.code

            ws.send(JSON.stringify({
                type:"joined",
                code:data.code
            }))
        }

        // 👤 ИМЯ
        if(data.type === "set_name"){
            ws.name = data.name

            const room = ws.room
            if(!room || !rooms[room]) return

            const players = rooms[room].clients.map(c=>c.name || "Игрок")

            rooms[room].clients.forEach(c=>{
                c.send(JSON.stringify({
                    type:"players",
                    players
                }))
            })
        }

        // ▶️ СТАРТ ИГРЫ
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

            const game = rooms[room].game

            game.players.forEach((p,i)=>{
                p.ws.send(JSON.stringify({
                    type:"your_cards",
                    cards: p.cards,
                    yourTurn: i === game.attackIndex,
                    trump: game.trump
                }))
            })
        }

        // 🃏 ХОД
        if(data.type === "card_played"){

            const room = ws.room
            if(!room || !rooms[room] || !rooms[room].game) return

            const game = rooms[room].game

            const playerIndex = game.players.findIndex(p => p.ws === ws)
            const player = game.players[playerIndex]

            const index = player.cards.indexOf(data.card)
            if(index === -1) return

            // ❗ ПРОВЕРКА ОЧЕРЕДИ
            if(game.phase === "attack" && playerIndex !== game.attackIndex) return
            if(game.phase === "defense" && playerIndex !== game.defendIndex) return
            if(game.phase === "throw" && playerIndex !== game.attackIndex) return

            // удалить карту
            player.cards.splice(index, 1)

            // 🃏 АТАКА
            if(game.phase === "attack"){
                game.table.push({ attack: data.card, defense: null })
                game.phase = "defense"
            }

            // 🛡 ЗАЩИТА
            else if(game.phase === "defense"){

                const last = game.table.find(p => !p.defense)
                if(!last) return

                if(!canBeat(last.attack, data.card, game.trump)) return

                last.defense = data.card

                const allDefended = game.table.every(p => p.defense)

                if(allDefended){
                    game.phase = "throw"
                }
            }

            // 🔁 ПОДКИДЫВАНИЕ
            else if(game.phase === "throw"){

                const values = game.table.flatMap(p => [
                    p.attack,
                    p.defense
                ]).filter(Boolean).map(c => c.slice(0,-1))

                if(!values.includes(data.card.slice(0,-1))) return

                game.table.push({ attack: data.card, defense: null })
                game.phase = "defense"
            }

            // 📡 ОБНОВЛЕНИЕ
            game.players.forEach((p,i)=>{
                p.ws.send(JSON.stringify({
                    type:"update_state",
                    table: game.table,
                    cards: p.cards,
                    yourTurn: i === game.attackIndex || i === game.defendIndex,
                    trump: game.trump
                }))
            })
        }

    })

    ws.on("close", () => {
        const room = ws.room
        if(!room || !rooms[room]) return

        rooms[room].clients = rooms[room].clients.filter(c => c !== ws)

        if(rooms[room].game){
            rooms[room].game.players =
                rooms[room].game.players.filter(p => p.ws !== ws)
        }

        if(rooms[room].clients.length === 0){
            delete rooms[room]
        }
    })

})
