export const createWebSocket = () => {
  const socket = new WebSocket("ws://localhost:8765");

  // Verbindungs-Events
  socket.addEventListener("open", () => {
    console.log("[WebSocket] Verbindung hergestellt");
  });

  socket.addEventListener("message", (event) => {
    console.log("[WebSocket] Nachricht empfangen:", event.data);
  });

  socket.addEventListener("close", () => {
    console.log("[WebSocket] Verbindung geschlossen");
  });

  socket.addEventListener("error", (error) => {
    console.error("[WebSocket] Fehler:", error);
  });

  return socket;
};
