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

            const code = data.code

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

            // отправить всем игрокам список
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

        // сообщение в комнате
        if(data.type === "message"){

            const room = ws.room
            if(!room) return

            rooms[room].forEach(client=>{
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type:"message",
                        text:data.text
                    }))
                }
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
