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

wss.on("connection", ws => {

    ws.on("message", message => {

        let data
        try {
            data = JSON.parse(message)
        } catch {
            return
        }

        if(data.card && typeof data.card !== "string") return

        // СОЗДАТЬ
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

        // ВОЙТИ
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

        // ИМЯ
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

        // СТАРТ
        if(data.type === "start_game"){

    if(!ws.room){
        console.log("❌ НЕТ ROOM У ИГРОКА")
        return
    }

    if(!rooms[ws.room]){
        console.log("❌ КОМНАТЫ НЕ СУЩЕСТВУЕТ")
        return
    }

    const room = ws.room

    console.log("🔥 START GAME:", room)

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

        // ХОД
        if(data.type === "card_played"){

            const game = rooms[ws.room]?.game
            if(!game) return

            const playerIndex = game.players.findIndex(p => p.ws === ws)
            const player = game.players[playerIndex]

            const index = player.cards.indexOf(data.card)
            if(index === -1) return

            let played = false

            // 🔥 АТАКА
            if(game.phase === "attack"){

                if(playerIndex !== game.attackIndex) return

                const value = data.card.slice(0,-1)

                if(game.table.length === 0){
                    game.table.push({ attack: data.card, defense: null })
                } else {
                    const values = game.table.flatMap(p => [
                        p.attack,
                        p.defense
                    ]).filter(Boolean).map(c => c.slice(0,-1))

                    if(!values.includes(value)) return

                    game.table.push({ attack: data.card, defense: null })
                }

                // 👉 СРАЗУ даём ход защите
                game.phase = "defense"

                played = true
            }

            // 🛡 ЗАЩИТА
            else if(game.phase === "defense"){

                if(playerIndex !== game.defendIndex) return

                const last = [...game.table].reverse().find(p => !p.defense)
                if(!last) return

                if(!canBeat(last.attack, data.card, game.trump)) return

                last.defense = data.card

                const allDefended = game.table.every(p => p.defense)

                if(allDefended){
                    game.phase = "throw"
                }

                played = true
            }

            // 🔁 ПОДКИДЫВАНИЕ
            else if(game.phase === "throw"){

                if(playerIndex !== game.attackIndex) return

                const values = game.table.flatMap(p => [
                    p.attack,
                    p.defense
                ]).filter(Boolean).map(c => c.slice(0,-1))

                if(!values.includes(data.card.slice(0,-1))) return

                game.table.push({ attack: data.card, defense: null })
                game.phase = "defense"

                played = true
            }

            if(played){
                player.cards.splice(index, 1)
            }

            sendState(ws.room)
        }

        // БЕРУ
        if(data.type === "take_cards"){

            const game = rooms[ws.room]?.game
            if(!game) return

            const playerIndex = game.players.findIndex(p => p.ws === ws)
            if(playerIndex !== game.defendIndex) return

            const defender = game.players[game.defendIndex]

            game.table.forEach(p=>{
                if(p.attack) defender.cards.push(p.attack)
                if(p.defense) defender.cards.push(p.defense)
            })

            game.table = []

            // ❗ атакующий остаётся тот же
            game.defendIndex = (game.attackIndex + 1) % game.players.length
            game.phase = "attack"

            drawCards(game)

            sendState(ws.room)
        }

        // БИТО
        if(data.type === "end_round"){

            const game = rooms[ws.room]?.game
            if(!game) return

            const playerIndex = game.players.findIndex(p => p.ws === ws)

            if(playerIndex !== game.attackIndex) return

            const hasOpen = game.table.some(p => !p.defense)
            if(hasOpen) return

            game.table = []

            game.attackIndex = game.defendIndex
            game.defendIndex = (game.defendIndex + 1) % game.players.length
            game.phase = "attack"

            drawCards(game)

            sendState(ws.room)
        }

    })

})

function drawCards(game){
    game.players.forEach(p=>{
        while(p.cards.length < 6 && game.deck.length > 0){
            p.cards.push(game.deck.pop())
        }
    })
}

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
                (game.phase === "defense" && i === game.defendIndex) ||
                (game.phase === "throw" && i === game.attackIndex)
        }))
    })
}
