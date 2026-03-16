const WebSocket = require("ws")

const PORT = process.env.PORT || 8080
const wss = new WebSocket.Server({ port: PORT })

let rooms = {}

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

    // лимит игроков
    if(rooms[code].length >= 8){
        ws.send(JSON.stringify({
            type:"error",
            message:"room_full"
        }))
        return
    }

    rooms[code].push(ws)
    ws.room = code

    ws.send(JSON.stringify({
        type:"joined",
        code:code
    }))

    // обновить список игроков
    const players = rooms[code].length

    rooms[code].forEach(client=>{
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify({
                type:"players",
                count:players
            }))
        }
    })

    console.log("Player joined room:", code)
}
