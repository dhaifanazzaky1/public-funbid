import { io } from "socket.io-client";

const socket = io("https://funbid.dhaifan.online", {
  autoConnect: false, 
  transports: ["websocket"],
});

export default socket;