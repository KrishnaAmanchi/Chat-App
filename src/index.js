const path=require("path")
const http=require("http")
const express=require("express")
const socketio=require("socket.io")
const app=express()
const server=http.createServer(app)
const io=socketio(server)
const port=process.env.PORT || 3000
const Filter=require("bad-words")
const publicDirectory=path.join(__dirname,'../public')
const {generateMessage,generateLocation}=require('./utils/messages.js')
const users=require('./utils/users.js')
app.use(express.static(publicDirectory))
let count=0
io.on('connection',(socket)=>{
    console.log("New websocket connection")

    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count)  
    //     io.emit('countUpdated',count)

    // })
    socket.on('join',(options,callback)=>{
        const {error,user}=users.addUser({id:socket.id,...options})// this is spread over... in that we have two variables one is username and another one is room
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("message",generateMessage("Admin","Welcome to the chat app"))
        socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined!`))
        io.emit("roomData",{
            room:user.room,
            users:users.getUsersInRoom(user.room)
        })
        callback()
    })
    
    
    socket.on('sendMessage',(message,callback)=>{
        const user=users.getUser(socket.id)
        
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }
        io.to(user.room).emit("message",generateMessage(user.username,message))
        callback("Delivered!")
    })
    socket.on('location',(position,callback)=>{
        const user=users.getUser(socket.id)
        io.to(user.room).emit("locationMessage",generateLocation(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })
    socket.on('disconnect',()=>{   
        const user=users.removeUser(socket.id)
        if(user){
            io.to(user.room).emit("message",generateMessage("Admin",`${user.username} has left!`))
            io.emit("roomData",{
                room:user.room,
                users:users.getUsersInRoom(user.room)
            })
        }
        
    })
// socket.on ivvadaniki reason entante chrome lo aa page ni remove cheste inka adi emit anedi undadu
// socket.on untundi adi kooda disconnect chesina ventane aa client socket chivaraga migilina vallaki message send chesi vellipotundi
})
server.listen(port,()=>{
    console.log("Server is running on ",port)
})