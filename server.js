const WebSocket = require("ws")

const PORT = process.env.PORT || 3000

const wss = new WebSocket.Server({ port: PORT })

let rooms = {}

wss.on("connection", ws => {

    ws.on("message", message => {

        const data = JSON.parse(message)

        // создать комнату
        if(data.type === "create"){
            const code = Math.random().toString(36).substring(2,6).toUpperCase()

            rooms[code] = [ws]
            ws.room = code

            ws.send(JSON.stringify({
                type:"room_created",
                code:code
            }))
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
        }

        // сообщение в комнату
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

})
