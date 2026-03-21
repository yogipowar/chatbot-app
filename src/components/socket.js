// src/socket.js
import { io } from "socket.io-client";

const URL = "https://chatbotapi.scrollosoft.com/";
export const socket = io(URL, {
  autoConnect: true // Starts the connection immediately
});