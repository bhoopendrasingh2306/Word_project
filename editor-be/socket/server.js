const io = require('socket.io')({
    cors: {
      origin: "http://localhost:3000",
    }
  });

  function getTopic(event) {
    return `doc_${event._id}`;
  }

const socket = () => {
    io.on('connection', client => { 

        console.log("socket client connected------", client.id)

         client.on('text', data => { 
            console.log("event data text", data);
            io.emit(getTopic(data), data)
         });
        client.on('disconnect', (info) => { 
            console.log("Disconnected", info)
         });
     });
    io.listen(3001, () => {
        console.log("Sockets running on: 3001")
    });
}

module.exports = {socket}
