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

        // ▶️ СТАРТ
        if(data.type === "start_game"){

            phase: "attack"

            const room = ws.room
            if(!room || !rooms[room]) return

            const deck = createDeck()

const trumpCard = deck[deck.length - 1] // последняя карта
const trumpSuit = trumpCard.slice(-1)

rooms[room].game = {
    players: rooms[room].clients.map(c => ({
        ws: c,
        cards: deck.splice(0,6)
    })),
    table: [],
    deck,
    turn: 0,
    trump: trumpSuit,
    attackIndex: 0,
    defendIndex: 1
}

            const game = rooms[room].game

            game.players.forEach((p,i)=>{
                p.ws.send(JSON.stringify({
                    type:"your_cards",
                    cards: p.cards,
                    yourTurn: i === 0
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

    // удалить карту
    player.cards.splice(index, 1)

    // 👉 АТАКА
    if(playerIndex === game.attackIndex){

        // первая карта
        if(game.table.length === 0){
            game.table.push({ attack: data.card, defense: null })
        } else {

            // можно подкидывать только по значению
            const values = game.table.flatMap(p => [
                p.attack,
                p.defense
            ]).filter(Boolean).map(c => c.slice(0,-1))

            if(!values.includes(data.card.slice(0,-1))){
                return // нельзя
            }

            game.table.push({ attack: data.card, defense: null })
        }
    }

    // 👉 ЗАЩИТА
    if(playerIndex === game.defendIndex){

        const last = game.table.find(p => !p.defense)
        if(!last) return

        if(!canBeat(last.attack, data.card, game.trump)){
            return // нельзя бить
        }

        last.defense = data.card

        // если все карты побиты → конец раунда
        const allDefended = game.table.every(p => p.defense)

        if(allDefended){
    game.phase = "throw"   // теперь можно подкидывать
}

            // смена ролей
            game.attackIndex = game.defendIndex
            game.defendIndex = (game.defendIndex + 1) % game.players.length
        }
    }

    // 📦 ДОБОР ДО 6
    game.players.forEach(p=>{
        while(p.cards.length < 6 && game.deck.length > 0){
            p.cards.push(game.deck.pop())
        }
    })

    // 📡 ОТПРАВКА
    game.players.forEach((p,i)=>{
        p.ws.send(JSON.stringify({
            type:"update_state",
            table: game.table,
            cards: p.cards,
            yourTurn: i === game.attackIndex || i === game.defendIndex,
            trump: game.trump,
            role: i === game.attackIndex ? "attack" : (i === game.defendIndex ? "defend" : "idle")
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

function canBeat(attack, defense, trump){

    const attackValue = attack.slice(0, -1)
    const attackSuit = attack.slice(-1)

    const defenseValue = defense.slice(0, -1)
    const defenseSuit = defense.slice(-1)

    const order = ["6","7","8","9","10","J","Q","K","A"]

    // одна масть
    if(defenseSuit === attackSuit){
        return order.indexOf(defenseValue) > order.indexOf(attackValue)
    }

    // козырь бьёт
    if(defenseSuit === trump && attackSuit !== trump){
        return true
    }

    return false
}
