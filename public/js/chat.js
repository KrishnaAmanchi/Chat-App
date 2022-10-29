const messageForm=document.querySelector('#message-form')
const messageFormButton=messageForm.querySelector('button')
const messageFormInput=messageForm.querySelector('input')

const locationButton=document.getElementById('location')
const messages=document.getElementById('messages')
const rooms=document.getElementById('sidebar')
const messageTemplate=document.getElementById('message-template').innerHTML
const locationTemplate=document.getElementById('location-template').innerHTML
const sidebarTemplate=document.getElementById('sidebar-template').innerHTML
const socket=io()

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.on("message",(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
    
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')

    })
    messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on("roomData",({room,users})=>{
    console.log(room)
    console.log(users)
    const html=Mustache.render(sidebarTemplate,{
       room,users
    })
    rooms.innerHTML=html
})

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    const mes=document.getElementById("message").value
    // we can also give like e.target.elements.message.value as the name is given as message
    //console.log(mes)
    messageFormButton.setAttribute('disabled','disabled')
    socket.emit("sendMessage",mes, (error)=>{
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value=''
        
        if(error){
            return console.log(error)
        }
        console.log("Message was delivered")
    })

})

locationButton.addEventListener('click',()=>{
    locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert("Geo location is not supported by your browser")
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("location",{latitude:position.coords.latitude,longitude:position.coords.longitude},()=>{
            locationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
        
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})